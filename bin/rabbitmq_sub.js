/**
 * Created by root on 21/5/17.
 */
var Users = require('../app/models/users');
var Checkout = require('../app/models/checkout');
var Checkin = require('../app/models/checkin');
var Vehicle = require('../app/models/vehicle');
var Constants = require('../app/core/constants');

var context = require('rabbit.js').createContext('amqp://test:test@13.13.13.1:5672?heartbeat=300');
context.on('ready', function() {
    var  userSub = context.socket('SUB');
    var  vehicleSub = context.socket('SUB');
    var  checkoutSub = context.socket('SUB');
    var  checkinSub = context.socket('SUB');

    userSub.set
    userSub.connect('users', function() {
        console.log('Users Connected');
    });

    vehicleSub.connect('vehicles', function() {
        console.log('vehicles Connected');
    });

    checkoutSub.connect('checkouts', function() {
        console.log('checkouts Connected');
    });

    checkinSub.connect('checkins', function() {
        console.log('checkins Connected');
    });

    userSub.on('data', function(user) {
        var userData = JSON.parse(user.toString());
        console.log("User: %s", userData.UserID);
        Users.findOne({UserID:userData.UserID},function (err,result) {
            if(err)
            {
                console.error('Unable to find users');
                // callback(err,null);
            }
            if(result)
            {
                delete userData._id;

                Users.findByIdAndUpdate(result._id,userData,{new:true},function (err,result) {
                    if(err) {
                        console.error('Unable to update users');
                    }

                });
            }
            else
            {
                Users.create(userData,function (err,result) {
                    if(err) {
                        console.error('err while creating user ' + err);
                    }
                });
            }

        });
    });

    vehicleSub.on('data', function(vehicle) {
        var vehicleData = JSON.parse(vehicle.toString());
        console.log("Vehicle: %s", vehicleData.vehicleUid);
        Vehicle.findOne({vehicleUid:vehicleData.vehicleUid},function (err,result) {
            if(err)
            {
                console.error('Unable to find vehicle');
                // callback(err,null);
            }
            if(result)
            {
                delete vehicle._id;
                Vehicle.findByIdAndUpdate(result._id,vehicleData,{new:true},function (err,result) {
                    if(err) {
                        console.error('Unable to update vehicle');
                    }
                });
            }
            else
            {
                Vehicle.create(vehicleData,function (err,result) {
                    if(err)
                    {
                        console.error('err while creating vehicle '+err);
                    }
                });
            }

        });
    });

    checkoutSub.on('data', function(checkout) {
        var checkoutData = JSON.parse(checkout.toString());
        console.log("checkoutData- vehicle:"+ checkoutData.vehicleId);
        Vehicle.findOne({vehicleUid:checkoutData.vehicleId},function (err,vehicleDetails) {
            if(err)
            {
                console.error('Error while updating vehicle for the synced checkout'+err);
            }
            Users.findOneAndUpdate({UserID:checkoutData.user},{$push:{vehicleId:{vehicleid:vehicleDetails._id,vehicleUid:vehicleDetails.vehicleUid}}},{new:true},function (err,userDetails) {
                if(err)
                {
                    console.error('Error while updating user for the synced checkout'+err);
                }

                Vehicle.findOneAndUpdate({vehicleUid:vehicleDetails.vehicleUid},{$set:{currentAssociationId:userDetails._id,vehicleCurrentStatus:Constants.VehicleLocationStatus.WITH_MEMBER}},function (err,vehicleDet) {
                    if (err) {
                        console.error('Error while updating vehicle for the synced checkout' + err);
                    }
                    Checkout.create(checkoutData,function (err,result) {
                        if(err) {
                            console.error('err while creating checkout. Ignore if it a duplicate entry error ' + err);
                        }
                    });
                });
            });
        });

    });

    checkinSub.on('data', function(checkin) {
        var checkinData = JSON.parse(checkin.toString());
        Checkin.create(checkinData,function (err,result) {
            if(err) {
                console.error('err while creating checkin. Ignore if it a duplicate entry error ' + err);
            }
        });
    });

});

context.on('error', function(e) {
    console.log(e);
   // setInterval(context, 5000);
});