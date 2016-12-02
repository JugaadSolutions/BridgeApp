/**
 * Created by root on 1/11/16.
 */
var async = require('async'),
    Vehicle = require('../models/vehicle'),
    Port = require('../models/port'),
    Constants = require('../core/constants'),
    CheckOut = require('../models/checkout'),
    CheckIn = require('../models/checkin'),
    EventLoggersHandler = require('../handlers/event-loggers-handler'),
    Messages = require('../core/messages'),
    Transaction = require('../services/transaction-service'),
    User = require('../models/user');


exports.updateDB = function (record,cb) {

//console.log('Update rec : '+JSON.stringify(record));

    var userUpdatedDetails;
    var vehicleData;
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
            if(record.type == 'checkout') {
                User.findOne({'smartCardNumber': record.cardRFID}).lean().exec(function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!result) {
                        EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                        return callback(new Error("Sorry! User with that RFID does not exist."), null);
                    }
                    if (record.type == 'checkout') {
                        var vehicleDetails = {
                            vehicleid: vehicleData._id,
                            vehicleUid: record.vehicleUid

                        };
                        result.vehicleId.push(vehicleDetails);
                    }
                    if (record.type == 'checkin') {
                        result.vehicleId = [];
                    }
                    User.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        userUpdatedDetails = result;
                    });

                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            Port.findOne({'FPGA':record.FPGA,'ePortNumber':record.ePortNumber}).lean().exec(function (err,result) {
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
                result.portStatus = record.portStatus;
                if(record.type=='checkout')
                {
                    result.vehicleId=[];
                }
                if(record.type=='checkin')
                {
                    var vehicleDetails = {
                        vehicleid: vehicleData._id,
                        vehicleUid: record.vehicleUid

                    };
                    result.vehicleId.push(vehicleDetails);
                }

                    Port.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        portUpdatedDetails = result;
                        //return callback(null,null);
                    });

                return callback(null,result);
            });

        }
        ,
        function (callback) {

                Vehicle.findOne({'vehicleUid':record.vehicleUid},function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!result) {
                        EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                        return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
                    }
                    if (record.type=='checkout') {
                        result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_MEMBER;
                        result.currentAssociationId = userUpdatedDetails._id;
                    }
                    if (record.type=='checkin') {
                        result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_PORT;
                        result.currentAssociationId = portUpdatedDetails._id;
                    }

                        Vehicle.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            vehicleData=result;
                            //return callback(null, result);
                        });
                    return callback(null, result);

                });

        },
        function (callback) {
            if(record.type=='checkout')
            {
                var transDetails = {
                    user:userUpdatedDetails.UserID,
                    vehicleId:vehicleData.vehicleUid,
                    fromPort:portUpdatedDetails.PortID//,
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
            if(record.type=='checkin')
            {
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
                        toPort: portUpdatedDetails.PortID//,
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
            }
        }

    ],function (err,result) {
        if(err)
        {
            return cb(err,null);
        }
        transactionResultDetails['fpga']=portUpdatedDetails.FPGA;
        transactionResultDetails['port']=portUpdatedDetails.ePortNumber;
        transactionResultDetails['clientPort']=record.clientPort;
        transactionResultDetails['clientHost']=record.clientHost;
        return cb(null,transactionResultDetails);
    });
};