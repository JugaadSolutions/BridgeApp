// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var
    MaintenancePort = require('../models/maintenance-port'),
    Messages = require('../core/messages');



exports.createPort=function (record,callback) {
    MaintenancePort.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};