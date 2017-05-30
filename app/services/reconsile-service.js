/**
 * Created by root on 7/5/17.
 */
var async = require('async'),
    moment = require('moment'),
    CheckOut = require('../models/checkout'),
    checkin = require('../models/checkin'),
    User = require('../models/users'),
    vehicle = require('../models/vehicle'),
    Membership = require('../models/membership'),
    eMemberships = require('../../bin/eMemberPlans');

exports.reconcile = function (callback) {
    var checkinDetails;
    async.series([
        function (callback) {
            checkin.find({'status':'Close','errorStatus':0,'localUpdate':0}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkinDetails = result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(checkinDetails.length>0)
            {
                async.forEach(checkinDetails,function (checkinDetail) {
                    CheckOut.findOne({
                        'vehicleId': checkinDetail.vehicleId,
                        'errorStatus':0,
                        'localUpdate':0,
                        'status':'Close',
                        'checkOutTime': {$lt:moment(checkinDetail.checkInTime)}
                    }).sort({'checkOutTime': -1}).exec(function (err, checkoutdetails) {
                        if (err) {
                            return console.error('Error : ' + err);
                        }
                        if (!checkoutdetails) {
                            return ;//console.error('No matching Checkout');
                        }
                        if(checkoutdetails) {
                            User.findOne({UserID:checkoutdetails.user},function (err,userDet) {
                                if(err)
                                {
                                    console.error("Couldn't able to find user at reconcilation");
                                }
                                if(userDet._type=='member')
                                {
                                    if(userDet.membershipId)
                                    {
                                        Membership.findOne({'_id':userDet.membershipId},function (err,membership) {
                                            if (err) {
                                                return console.error('Reconciliation Membership Error : ' + err);
                                            }
                                            for (var i = 0; i < eMemberships.length; i++) {


                                                if (membership.userFees == eMemberships[i].userFees) {
                                                    var checkInTime = moment(checkinDetail.checkInTime);
                                                    var checkOutTime = moment(checkoutdetails.checkOutTime);

                                                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                                    var duration = durationMin.asMinutes();
                                                    var fee = 250;
                                                    for (var j = 0; j < eMemberships[i].plans.length; j++) {

                                                        if (duration <= eMemberships[i].plans[j].endTime) {
                                                            fee = eMemberships[i].plans[j].fee;
                                                            var balance = Number(userDet.creditBalance)-fee;
                                                            User.findByIdAndUpdate(userDet._id,{$set: {'creditBalance': balance,vehicleId:[]}}, {new: true},function (err, updatedUser) {
                                                                if (err) {
                                                                    return console.error('Error ' + err);
                                                                }
                                                                console.log('Updated balance : '+updatedUser.creditBalance);
                                                                CheckOut.findByIdAndUpdate(checkoutdetails._id,{$set:{localUpdate:1}},{new:true},function (err) {
                                                                    if(err)
                                                                    {
                                                                        console.error('checkout local update status updation error'+err)
                                                                    }
                                                                });
                                                                checkin.findByIdAndUpdate(checkinDetail._id,{$set:{localUpdate:1}},{new:true},function (err) {
                                                                    if(err)
                                                                    {
                                                                        console.error('checkin local update status updation error'+err)
                                                                    }
                                                                });
                                                                //return callback(null,updatedUser);
                                                            });
                                                            break;
                                                        }

                                                    }

                                                    break;
                                                }
                                            }
                                        });
                                    }
                                }
                                else
                                {
                                    if (userDet.vehicleId.length > 0) {
                                        for (var i = 0; i < userDet.vehicleId.length; i++) {
                                            if (userDet.vehicleId[i].vehicleUid==checkoutdetails.vehicleId) {
                                                userDet.vehicleId.splice(i, 1);
                                            }
                                        }
                                        User.findByIdAndUpdate(userDet._id,{$set: {vehicleId: userDet.vehicleId}}, {new: true},function (err, updatedUser) {
                                            if (err) {
                                                return console.error('Error ' + err);
                                            }
                                            console.log('Employee updated');
                                            CheckOut.findByIdAndUpdate(checkoutdetails._id,{$set:{localUpdate:1}},{new:true},function (err) {
                                                if(err)
                                                {
                                                    console.error('checkout local update status updation error'+err)
                                                }
                                            });
                                            checkin.findByIdAndUpdate(checkinDetail._id,{$set:{localUpdate:1}},{new:true},function (err) {
                                                if(err)
                                                {
                                                    console.error('checkin local update status updation error'+err)
                                                }
                                            });
                                           // return callback(null,updatedUser);
                                        });
                                    }
                                    /*else
                                    {
                                        return callback(null,userDet);
                                    }*/
                                }
                            });
                        }
                        else {
                            return callback(null,null);
                        }
                    });
                },function (err) {
                    console.error('Error : '+err);
                    //callback();
                });
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};