/**
 * Created by root on 1/11/16.
 */
var async = require('async'),
    moment = require('moment'),
    Vehicle = require('../models/vehicle'),
    Member = require('../models/member'),
    Membership = require('../models/membership'),
    Port = require('../models/port'),
    Constants = require('../core/constants'),
    CheckOut = require('../models/checkout'),
    CheckIn = require('../models/checkin'),
    FarePlanService = require('../services/fare-plan-service'),
    EventLoggersHandler = require('../handlers/event-loggers-handler'),
    Messages = require('../core/messages'),
    Transaction = require('../services/transaction-service'),
    eMemberships = require('../../bin/eMemberPlans'),
    User = require('../models/user');


exports.updateDB = function (record,cb) {

//console.log('Update rec : '+JSON.stringify(record));

    var userUpdatedDetails;
    var userDetails;
    var vehicleData;
    var portdetails;
    var portUpdatedDetails;
    var transDetails;
    var transactionResultDetails;
    var update=0;


    async.series([
        function (callback) {
            Vehicle.findOne({'vehicleUid':record.vehicleUid},function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                    return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
                }
                vehicleData=result;
                return callback(null,result);
            });

        },
        function(callback)
        {

            User.findOne({'smartCardNumber': record.cardRFID}).lean().exec(function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                    return callback(new Error("Sorry! User with that RFID does not exist."), null);
                }
                userDetails = result;
/*                var vehicleDetails = {
                    vehicleid: vehicleData._id,
                    vehicleUid: vehicleData.vehicleUid

                };
                result.vehicleId.push(vehicleDetails);


                User.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    console.log('User Updated');
                    // userUpdatedDetails = result;
                });*/

                return callback(null, result);
            });

        },
        function (callback) {
            console.log('Checkout from : Unit '+record.FPGA+' ePortNumber : '+record.ePortNumber);
            Port.findOne({'PortID':record.PortID}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + record.FPGA);
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER +record.ePortNumber);
                    return callback(new Error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + " and " + Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER), null);
                }
                portdetails = result;
                result.portStatus = record.portStatus;

                result.vehicleId=[];
                Port.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    console.log('Port Updated');
                    //portUpdatedDetails = result;
                    //return callback(null,null);
                });

                return callback(null,result);
            });

        }
        ,
        function (callback) {
            /*
             Vehicle.findOne({'vehicleUid':record.vehicleUid},function (err, result) {
             if (err) {
             return callback(err, null);
             }
             if (!result) {
             EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
             return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
             }
             */
            vehicleData.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_MEMBER;
            vehicleData.currentAssociationId = userDetails._id;
            Vehicle.findByIdAndUpdate(vehicleData._id, vehicleData, {new: true}, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                console.log('Vehicle Updated');
                //vehicleData=result;
                return callback(null, result);
            });


            /*          });*/

        },
        function (callback) {

            var transDetails = {
                user:userDetails.UserID,
                vehicleId:vehicleData.vehicleUid,
                fromPort:portdetails.PortID//,
                //checkOutTime:Date.now
            };
            /*Transaction.checkout(transDetails,function (err,result) {
             if(err)
             {
             return callback(err,null);
             }
             transDetails=result;
             return callback(null,result);
             });*/
            CheckOut.create(transDetails, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                transactionResultDetails = result;
                return callback(null, result);
            });
        }

    ],function (err,result) {
        if(err)
        {
            return cb(err,null);
        }
        transactionResultDetails['fpga']=portdetails.FPGA;
        transactionResultDetails['port']=portdetails.ePortNumber;
        transactionResultDetails['clientPort']=record.clientPort;
        transactionResultDetails['clientHost']=record.clientHost;
        return cb(null,transactionResultDetails);
    });
};

exports.updateDBcheckin = function (record,cb) {

//console.log('Update rec : '+JSON.stringify(record));

    var userUpdatedDetails;
    var userDetails;
    var vehicleData;
    var portdetails;
    var portUpdatedDetails;
    var transDetails;
    var transactionResultDetails;
    var update=0;
    var ismember=false;

    async.series([
        function (callback) {
            Vehicle.findOne({'vehicleUid':record.vehicleUid},function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                    return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
                }
                vehicleData=result;
                return callback(null,result);
            });

        },
        function(callback)
        {
            if(vehicleData.vehicleCurrentStatus==Constants.VehicleLocationStatus.WITH_MEMBER) {
                User.findOne({'_id': vehicleData.currentAssociationId}).deepPopulate('membershipId').lean().exec(function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!result) {
                        EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                        return callback(new Error("Sorry! User with that RFID does not exist."), null);
                    }
                    if (result) {
                        userDetails = result;
                        if (result._type == 'member') {
                            //if(result.vehicleId.length>0) {
                            result.vehicleId = [];
                            ismember=true;
                            // }
                        }
                        else {
                            if (result.vehicleId.length > 0) {
                                for (var i = 0; i < result.vehicleId.length; i++) {
                                    if (result.vehicleId[i].vehicleid.equals(vehicleData._id)) {
                                        result.vehicleId.splice(i, 1);
                                    }
                                }
                            }

                        }
                        User.findByIdAndUpdate(result._id, result, function (err, result) {
                            if (err) {
                                return console.error('Error : ' + err);
                            }
                        });
                    }

                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            console.log('Checkin to : Unit '+record.FPGA+' ePortNumber : '+record.ePortNumber);
            Port.findOne({'PortID':record.PortID}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + record.FPGA);
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER +record.ePortNumber);
                    return callback(new Error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + " and " + Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER), null);
                }
                portdetails = result;
                result.portStatus = record.portStatus;
                var vehicleDetails = {
                    vehicleid: vehicleData._id,
                    vehicleUid: record.vehicleUid

                };
                result.vehicleId=[];
                result.vehicleId.push(vehicleDetails);

                Port.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    console.log('Port Updated : Checkin');
                    //portUpdatedDetails = result;
                    //return callback(null,null);
                });

                return callback(null,result);
            });

        }
        ,
        function (callback) {

            /*            Vehicle.findOne({'vehicleUid':record.vehicleUid},function (err, result) {
             if (err) {
             return callback(err, null);
             }
             if (!result) {
             EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
             return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
             }*/

            vehicleData.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_PORT;
            vehicleData.currentAssociationId = portdetails._id;

            Vehicle.findByIdAndUpdate(vehicleData._id, vehicleData, {new: true}, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                console.log('Vehicle Updated : Checkin');
                //vehicleData=result;
                return callback(null, result);
            });


            /*    });*/

        },
        function (callback) {

            /*if(userUpdatedDetails.UserID) {
             var transDetails = {
             user: userUpdatedDetails.UserID,
             vehicleId: vehicleData.vehicleUid,
             toPort: portUpdatedDetails.PortID//,
             //checkOutTime:Date.now
             };
             }else {*/
            var transDetails = {
                vehicleId: vehicleData.vehicleUid,
                toPort: portdetails.PortID//,
                //checkOutTime:Date.now
            };
            //}
            /*Transaction.checkout(transDetails,function (err,result) {
             if(err)
             {
             return callback(err,null);
             }
             transDetails=result;
             return callback(null,result);
             });*/
            CheckIn.create(transDetails, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                transactionResultDetails = result;
                return callback(null, result);
            });
        },
        function (callback) {
            if(!userDetails)
            {
                return callback(null,null);
            }
            else
            {
                CheckOut.findOne({
                    'vehicleId': transactionResultDetails.vehicleId,
                    'checkOutTime': {$lt:moment(transactionResultDetails.checkInTime)}
                }).sort({'checkOutTime': -1}).exec(function (err, checkoutdetails) {
                    if (err) {
                        return console.error('Error : ' + err);
                    }
                    if (!checkoutdetails) {
                        return console.error('No matching Checkout');
                    }
                    if(checkoutdetails) {
                        Membership.findOne({'_id':userDetails.membershipId},function (err,membership) {
                            if (err) {
                                return console.error('Reconciliation Membership Error : ' + err);
                            }
                            for (var i = 0; i < eMemberships.length; i++) {


                                if (membership.subscriptionType == eMemberships[i].subscriptionType) {
                                    var checkInTime = moment(transactionResultDetails.checkInTime);
                                    var checkOutTime = moment(checkoutdetails.checkOutTime);

                                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                    var duration = durationMin.asMinutes();
                                    var fee = 250;
                                    for (var j = 0; j < eMemberships[i].plans.length; j++) {

                                        if (duration <= eMemberships[i].plans[j].endTime) {
                                            fee = eMemberships[i].plans[j].fee;
                                            var balance = Number(userDetails.creditBalance)-fee;
                                            Member.findByIdAndUpdate(userDetails._id,{$set: {'creditBalance': balance}}, {new: true},function (err, updatedUser) {
                                                if (err) {
                                                    return console.error('Error ' + err);
                                                }
                                                console.log('Updated balance : '+updatedUser.creditBalance);
                                                return callback(null,updatedUser);
                                            });
                                            break;
                                        }

                                    }

                                    break;
                                }
                            }
                        });

                    }
                    else {
                        return callback(null,null);
                    }
                });
            }
        }
    ],function (err,result) {
        if(err)
        {
            return cb(err,null);
        }
        transactionResultDetails['fpga']=portdetails.FPGA;
        transactionResultDetails['port']=portdetails.ePortNumber;
        transactionResultDetails['clientPort']=record.clientPort;
        transactionResultDetails['clientHost']=record.clientHost;
        return cb(null,transactionResultDetails);
    });
};
