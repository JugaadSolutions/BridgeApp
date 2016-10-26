// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var //DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    HoldingPort = require('../models/holding-port'),
    Messages = require('../core/messages');

// Method to create Docking Port
/* ***************************** With Inheritence ************************ */

exports.createPort=function (record,callback) {
    HoldingPort.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};