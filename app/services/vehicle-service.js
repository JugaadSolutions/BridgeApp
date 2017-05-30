var async = require('async'),
    config = require('config'),
    Vehicle=require('../models/vehicle'),
    mongoose = require('mongoose'),
    Port = require('../models/port'),
    CheckOut = require('../models/checkout'),
    User = require('../models/users'),
    Constants = require('../core/constants'),
    LocalUpdate = require('../services/localupdate-service'),
    moment = require('moment'),
    Messages = require('../core/messages');

var BL = require('../../bin/blacklistUser');
var BlackList = [];
BlackList = BL;


exports.addBicycle=function (record, callback) {

    var vehicleRecord;
    var fleetRecord;

    async.series([
        function (callback) {
            Port.findById(record.fleetId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }

                if(result.VehicleCapacity==result.vehicleId.length)
                {
                    return callback(new Error(Messages.FLEET_FULL));
                }
                fleetRecord = result;
                return callback();
            });
        },
        function (callback) {
            var addVehicle={
                fleetId:fleetRecord._id,
                vehicleNumber:record.vehicleNumber,
                vehicleRFID:record.vehicleRFID,
                currentAssociationId:fleetRecord._id

            };
            //record.push(addAssociation);
            Vehicle.create(addVehicle,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.RECORD_EXISTS));
                }
                vehicleRecord = result.toObject();
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findById(vehicleRecord.fleetId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                var vehicleDetails={
                    vehicleid:vehicleRecord._id,
                    vehicleUid:vehicleRecord.vehicleUid
                };
                result.vehicleId.push(vehicleDetails);
                Port.findByIdAndUpdate(result._id,result,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error(Messages.RECORD_EXISTS));
                    }
                    return callback();
                });
            });

        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,vehicleRecord);
    });
};

exports.getAllRecords=function (record,callback) {

    Vehicle.find({}).deepPopulate('currentAssociationId').lean().exec(function (err, result)  {
        if (err) {
            return callback(err, null);
        }
        //userDetails = result;
        //farePlanId = result.membershipId.farePlan;
        return callback(null, result);
    });


    /*Vehicle.find({},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });*/
};

exports.vehicleVerification = function (record,id,callback) {

    var vehicleDetails;
    async.series([
        function (callback) {
            Vehicle.findOne({'vehicleRFID':record.data},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    record.portStatus=Constants.AvailabilityStatus.ERROR;
                    return callback(null,result);
                }
                vehicleDetails=result;
                record.vehicleRFID=result.vehicleRFID;
                record.vehicleUid=result.vehicleUid;
                if(record.portStatus != Constants.AvailabilityStatus.ERROR)
                {
                    record.portStatus = Constants.AvailabilityStatus.FULL;
                }
                return callback(null,result);
            });
        },function (callback) {
            if(id==1) {
                CheckOut.findOne({
                    vehicleId: record.vehicleUid,
                    localEntry:true,
                    checkOutTime: {$lt: moment()}
                }).sort({checkOutTime: -1}).lean().exec(function (err, coutDetails) {
                    if (err) {
                        return callback(null, null);
                    }
                    if (coutDetails) {
                        var durationMin = moment.duration(moment().diff(coutDetails.checkOutTime));
                        var duration = durationMin.asMinutes();
                        if (duration < 1) {
                            User.findOne({UserID: coutDetails.user}).exec(function (err, result) {
                                if (err) {
                                    return callback(null, null);
                                }
                                if (!result) {
                                    return callback(null, null);
                                }
                                else {
                                    if(result._type=='member')
                                    {
                                        BlackList.push(result.smartCardNumber);
                                        blacklist(result.smartCardNumber);
                                    }
                                    return callback(null, null);
                                }
                            });
                        }
                        else {
                            return callback(null, null);
                        }
                    }
                    else {
                        return callback(null, null);
                    }
                });
            }
            else
                {
                    return callback(null,null);
                }
        },
        function (callback) {
            if(id==1)
            {
                if(vehicleDetails)
                {
                    var obj = {
                        type: 'checkin',
                        PortID: record.PortID,
                        FPGA: record.FPGA,
                        ePortNumber: record.ePortNumber,
                        UserID: record.UserID,
                        cardRFID: record.cardRFID,
                        vehicleRFId: record.vehicleRFId,
                        vehicleUid: record.vehicleUid,
                        portStatus: record.portStatus,
                        clientPort: record.clientPort,
                        clientHost: record.clientHost
                    };
                    LocalUpdate.updateDBcheckin(obj,function (err,result) {
                        if(err){
                            return callback(err,null);
                        }
                        callback(null,result);
                    });
                }
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
        return callback(null,record);
    });

};

function blacklist(rfid) {
    var RFID = rfid;
    setTimeout(function () {
        for(var i=0;i<BlackList.length;i++)
        {
            if(BlackList[i]==RFID)
            {
                BlackList.splice(i,1);
            }
        }
    },60000*Number(config.get('blacklistDelay')));
}