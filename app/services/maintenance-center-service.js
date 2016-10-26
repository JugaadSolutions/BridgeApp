/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async')
    /*config = require('config'),
     request = require('request')*/;
var MaintenanceCenter=require('../models/maintenance-center');



exports.createDS = function (record,callback) {

    MaintenanceCenter.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};
