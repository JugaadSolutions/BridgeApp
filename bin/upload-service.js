/**
 * Created by green on 11/11/16.
 */
var async = require('async');
var CheckOut = require('../app/models/checkout'),
    CheckIn = require('../app/models/checkin');
var RequestService = require('./../app/services/request-service');

exports.Checkoutuploader = function (callback) {

    var checkoutData;
    var checkinData=0;
    async.series([
        function (callback) {
            CheckOut.find({'status':'Open',localEntry:true}).sort({'checkOutTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkoutData = result;
                return callback(null,result);
            });
        },

        function (callback) {
            if(checkoutData)
            {   var cdata = [];
                cdata = checkoutData;
                for(var i=0;i<cdata.length;i++)
                {
                   /* http://43.251.80.79:13055/api/transactions/checkout/
                        cardId
                    vehicleId
                    fromPort
                    checkOutTime

                    http://43.251.80.79:13055/api/transactions/checkin 
                        vehicleId 
                    toPort 
                    checkInTime */

                    var httpMethod = 'POST',
                        uri = 'transactions/checkout/bridge',
                        requestBody = {

                            "cardId": cdata[i].user,
                            "vehicleId": cdata[i].vehicleId,
                            "fromPort": cdata[i].fromPort,
                            "checkOutTime":cdata[i].checkOutTime,
                            "checkOutInitiatedTime":cdata[i].checkOutInitiatedTime,
                            "checkOutCompletionTime":cdata[i].checkOutCompletionTime
                        };

                    RequestService.requestHandler(httpMethod, uri, requestBody,function (err,result) {
                       if(err)
                       {
                           console.log('Checkout Connection Error');
                           return callback(err,null);
                       }
                       if(!result)
                       {
                           return callback(new Error("Unable to Update Data"),null);
                       }
                        CheckOut.findOneAndUpdate({"user":result.user,"vehicleId":result.vehicleId,"fromPort":result.fromPort,"status":'Open'},{$set:{"status":"Close","errorStatus":result.errorStatus,"errorMsg":result.errorMsg}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
                   });
                }
            }
            else
            {
                return callback(null,null);
            }
        }/*,
        function (callback) {
            CheckIn.find({'status':'Open'}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkinData = result;
                return callback(null,result);
            });
        },
        function (callback) {

            if(checkinData!=0)
            {   var cidata = [];
                cidata = checkinData;
                for(var i=0;i<cidata.length;i++)
                {
                    /!* http://43.251.80.79:13055/api/transactions/checkout/
                     cardId
                     vehicleId
                     fromPort
                     checkOutTime

                     http://43.251.80.79:13055/api/transactions/checkin
                     vehicleId
                     toPort
                     checkInTime *!/

                    var httpMethod = 'POST',
                        uri = 'transactions/checkin/bridge',
                        requestBody = {
                            "vehicleId": cidata[i].vehicleId,
                            "toPort": cidata[i].toPort,
                            "checkInTime":cidata[i].checkInTime
                        };

                    RequestService.requestHandler(httpMethod, uri, requestBody,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Data couldn't able to update"),null);
                        }
                        CheckIn.findOneAndUpdate({"user":result.user,"vehicleId":result.vehicleId,"toPort":result.toPort,"checkInTime":result.checkInTime},{$set:{"status":"Close"}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }*/
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};

exports.Checkinuploader = function (callback) {
    var checkinData;
    async.series([

        function (callback) {
            CheckIn.find({'status':'Open',localEntry:true}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkinData = result;
                return callback(null,result);
            });
        },
        function (callback) {

            if(checkinData)
            {   var cidata = [];
                cidata = checkinData;
                for(var i=0;i<cidata.length;i++)
                {
                    /* http://43.251.80.79:13055/api/transactions/checkout/
                     cardId
                     vehicleId
                     fromPort
                     checkOutTime

                     http://43.251.80.79:13055/api/transactions/checkin
                     vehicleId
                     toPort
                     checkInTime */

                    var httpMethod = 'POST',
                        uri = 'transactions/checkin/bridge',
                        requestBody = {
                            "vehicleId": cidata[i].vehicleId,
                            "toPort": cidata[i].toPort,
                            "checkInTime":cidata[i].checkInTime
                        };

                    RequestService.requestHandler(httpMethod, uri, requestBody,function (err,result) {
                        if(err)
                        {
                            console.log('Checkin Connection Error');
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Data couldn't able to update"),null);
                        }
                        CheckIn.findOneAndUpdate({/*"user":result.user,*/"vehicleId":result.vehicleId,"toPort":result.toPort,"checkInTime":result.checkInTime},{$set:{"status":"Close","errorStatus":result.errorStatus,"errorMsg":result.errorMsg}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
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
        return callback(null,result);
    });

};