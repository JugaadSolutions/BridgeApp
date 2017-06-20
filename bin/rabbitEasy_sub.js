/**
 * Created by root on 18/6/17.
 */
var network = require('network');
var amqp;
var Station = require('../app/models/station');
var Users = require('../app/models/users');
var Checkout = require('../app/models/checkout');
var Checkin = require('../app/models/checkin');
var Vehicle = require('../app/models/vehicle');
var Constants = require('../app/core/constants');

network.get_active_interface(function(err, obj) {
    if (err) {
        console.log('No Network interface Detected');
    }
    if(obj)
    {
        if(obj.gateway_ip=="13.13.13.1")
        {
            amqp = require('amqplib-easy')('amqp://test:test@13.13.13.1:5672');
            connect();
        }
        else
        {
            var ip = obj.gateway_ip.split(".");
            if(ip[0]=="13"&&ip[1]=="13")
            {
                process.exit(1);
            }
            else
            {
                amqp = require('amqplib-easy')('amqp://test:test@43.251.80.79:5672');
                connect();

            }

        }
    }
});

function connect() {
    Station.findOne({},function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(!result)
        {
            console.error("No station found");
        }
        else
        {
            amqp.consume(
                {
                    exchange: 'usersEasy',
                    queue: result.name+'.users',
                    topics: [ 'found.*' ]
                },
                function (usersEasy) {
                    console.log('Users', usersEasy.json.UserID);
                    console.log('CardNumber', usersEasy.json.cardNum);
                    var userData = usersEasy.json;
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
                }
            );

            amqp.consume(
                {
                    exchange: 'vehiclesEasy',
                    queue: result.name+'.vehicles',
                    topics: [ 'found.*' ]
                },
                function (vehiclesEasy) {
                    console.log('Vehicles', vehiclesEasy.json.vehicleNumber);
                    var vehicleData = vehiclesEasy.json;
                    Vehicle.findOne({vehicleUid:vehicleData.vehicleUid},function (err,result) {
                        if(err)
                        {
                            console.error('Unable to find vehicle');
                            // callback(err,null);
                        }
                        if(result)
                        {
                            delete vehicleData._id;
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
                }
            );

            amqp.consume(
                {
                    exchange: 'checkoutsEasy',
                    queue: result.name+'.checkouts',
                    topics: [ 'found.*' ]
                },
                function (checkoutsEasy) {
                    var checkoutData = checkoutsEasy.json;
                    console.log("checkoutData- vehicle:"+ checkoutData.vehicleId);
                    Vehicle.findOne({vehicleUid:checkoutData.vehicleId},function (err,vehicleDetails) {
                        if(err)
                        {
                            console.error('Error while updating vehicle for the synced checkout'+err);
                        }
                        if(!vehicleDetails)
                        {
                            console.error('Error vehicle is not synced to process this checkout : vehicleUid = '+checkoutData.vehicleId);
                        }
                        else
                        {
                            Users.findOne({UserID:checkoutData.user},function (err,userDet) {
                                if(err)
                                {
                                    console.error('Error while finding user for the synced checkout'+err);
                                }
                                if(!userDet)
                                {
                                    console.error('Error user is not synced to process this checkout : UserID = '+checkoutData.user);
                                }
                                else
                                {
                                    Users.findByIdAndUpdate(userDet._id,{$push:{vehicleId:{vehicleid:vehicleDetails._id,vehicleUid:vehicleDetails.vehicleUid}}},{new:true},function (err,userDetails) {
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
                                }
                            });
                        }

                    });
                }
            );

            amqp.consume(
                {
                    exchange: 'checkinsEasy',
                    queue: result.name+'.checkins',
                    topics: [ 'found.*' ]
                },
                function (checkinsEasy) {
                    var checkinData = checkinsEasy.json;
                    console.log("checkinData- vehicle:"+ checkinData.vehicleId);
                    Checkin.create(checkinData,function (err,result) {
                        if(err) {
                            console.error('err while creating checkin. Ignore if it a duplicate entry error ' + err);
                        }
                    });
                }
            );
        }
    });

}

