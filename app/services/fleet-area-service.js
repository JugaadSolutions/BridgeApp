/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async')
    /*config = require('config'),
     request = require('request')*/;
var FleetArea=require('../models/fleet-area');



exports.createDS = function (record,callback) {

    FleetArea.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};
