/**
 * Created by root on 8/5/17.
 */
var async = require('async'),
    eport = require('../../bin/eport'),
    Port = require('../models/port');

exports.updatePort = function (record,callback) {

    var portDetails;
    async.series([
        function (callback) {
            for(var i=0;i<eport.length;i++)
            {
                if(record.portId==eport[i].PortID)
                {
                    eport[i].portStatus = record.portStatus;
                }
            }
            return callback(null,null);
        },
        function (callback) {
            Port.findOne({PortID:record.portId},function (err,result) {
             if(err)
             {
             return callback(err,null);
             }
             if(!result)
             {
             return callback(new Error("Port error"),null);
             }
                Port.findByIdAndUpdate(result._id,{$set:{portStatus:record.portStatus}},{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    portDetails=result;
                    return callback(null,result);
                });
             });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,portDetails);
    });

};