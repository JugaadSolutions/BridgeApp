var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    DockPort=require('../models/dock-port'),
    Messages = require('../core/messages'),
    Port = require('../models/port');
var fleet = require('../models/fleet');

var TransactionAssociation = require('../models/transaction-association'),
    FarePlanService = require('../services/fare-plan-service'),
    Transaction = require('../models/transaction');


exports.ReconcileTransaction=function (record,callback) {

    var userDetails=0;
    var memberObject;
    var vehiclesDetails;
    var dockingPortDetails;
    var checkInDetails;
    var checkOutDetails=0;
    var ismember=true;
    var farePlanId;
    var creditUsed;
    var checkinEntry;
    var errorstatus=0;
    var errormsg='';
    var duration;
    var transAssociation=0;
    var balance;

    async.series([
        function (callback) {
            User.findOne({'_id':record.user},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result._type!='member')
                {
                    ismember=false;
                }
                userDetails=result;
                return callback(null,result);
            });
        },

        function (callback) {
          if(ismember)
          {
              Member.findOne({'_id': userDetails._id}).populate('membershipId').lean().exec(function (err, result) {

                  if (err) {
                      return callback(err, null);
                  }

                  if (!result) {
                      return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                  }

                  memberObject = result;
                  farePlanId = result.membershipId.farePlan;
                  return callback(null, result);

              });
          }
          //return callback(null,null);
        },
        /*function (callback) {
            vehicle.findById(record.vehicleId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehiclesDetails=result;
                return callback(null,result);
            });
        },*/

 /*function (callback) {

        /!* if (vehiclesDetails.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER) {*!/
             Member.findOne({record.: vehiclesDetails.currentAssociationId}).populate('membershipId').lean().exec(function (err, result) {
                 if (err) {
                     return callback(err, null);
                 }
                 userDetails = result;
                 farePlanId = result.membershipId.farePlan;
                 return callback(null, result);
             });
        // }
         /!*else {*!/
             Member.findOne({'_id': vehiclesDetails.currentAssociationId}, function (err, result) {
                 if (err) {
                     return callback(err, null);
                 }
                 userDetails = result;
                 return callback(null, result);
             });
        // }


 },
*/
 /*function (callback) {

     CheckIn.findByIdAndUpdate(checkInDetails._id, {$set: {'user': userDetails._id}}, function (err, result) {
         if (err) {
             return callback(err, null);
         }
         return callback(null, result);
     });
 },
*/          
           /* function (callback) {
                CheckOut.find
            }
            ,*/
            function (callback) {
                /*CheckOut.findOne({"$and":[{'vehicleId':{ $elemMatch: { $eq :record.vehicleId} },
                                            'status':{ $elemMatch: { $eq: 'Open'} },
                                            'checkOutTime':{ $elemMatch: {$lt:record.checkInTime} } }]}).sort({'checkOutTime': -1}).exec(function (err,result) {
*/

                        CheckOut.findOne({
                    'vehicleId': record.vehicleId,
                    'status': 'Open',
                            'checkOutTime': {$lt:moment(record.checkInTime)}
                }).sort({'checkOutTime': -1}).exec(function (err, result) {
                    if (err) {
                        return callback();
                    }
                    checkOutDetails = result;
                    return callback(null, result);
                });
            },


            /* function (callback) {
                 if (userDetails.role == 'member') {
                     var checkintime = moment(record.checkInTime);
                     var checkouttime = moment(checkOutDetails.checkOutTime);
                     duration = checkintime.diff(checkouttime, 'minutes');
                 }
             },*/

            function (callback) {
                if(ismember)
                {
                    var checkInTime = moment(record.checkInTime);
                    var checkOutTime = moment(checkOutDetails.checkOutTime);

                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                    duration = durationMin.asMinutes();
                    FarePlanService.calculateFarePlan(farePlanId, duration, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        creditUsed = result;
                        return callback(null, result);
                    });
                }

            },
        function (callback) {
                if(ismember) {
                     balance = Number(memberObject.creditBalance) - creditUsed;
                    Member.findByIdAndUpdate(memberObject._id, {
                        $set:{'creditBalance': balance}
                    }, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        memberObject = result;
                        return callback(null, result);

                    });
                }
        },

 function (callback) {
    if (checkOutDetails!=0) {
        var transactionAssoc = {
            checkInEntry: record._id,
            checkOutEntry: checkOutDetails._id
        };
        TransactionAssociation.create(transactionAssoc, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            transAssociation = result;
            return callback(null, result);
        });
    }

 },
            function (callback) {
                CheckIn.findByIdAndUpdate(transAssociation.checkInEntry,{$set:{'status':'Close'}},{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkInDetails=result;
                    return callback(null,result);
                });

            },
        function (callback) {
            CheckOut.findByIdAndUpdate(transAssociation.checkOutEntry,{$set:{'status':'Close'}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
            ,
 function (callback) {
     var transaction;
                if(ismember){

                    transaction = {
                        user: record.user,
                        vehicle:record.vehicleId,
                        fromPort: checkOutDetails.fromPort,
                        toPort: record.toPort,
                        checkOutTime: checkOutDetails.checkOutTime,
                        checkInTime: record.checkInTime,
                        duration:duration,
                        creditsUsed:creditUsed,
                        creditBalance:balance,
                        status: 'Close'
                    };
                }
                else {
                    transaction = {
                        user: record.user,
                        vehicle:record.vehicleId,
                        fromPort: checkOutDetails.fromPort,
                        toPort: record.toPort,
                        checkOutTime: checkOutDetails.checkOutTime,
                        checkInTime: record.checkInTime,
                        status: 'Close'
                    };
                }

         Transaction.create(transaction, function (err, result) {
             if (err) {
                 return callback(err, null);
             }
             return callback(null, result);
         });

 }],
        function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,checkInDetails);
        });
};

