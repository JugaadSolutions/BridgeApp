var async = require('async'),
    Fleet=require('../models/fleet');

exports.addFleet=function (record, callback) {

/*
   async([


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

*/
    record.portCapacity=record.VehicleCapacity;
Fleet.create(record,function (err,result) {
    if(err)
    {
        return callback(err,null);
    }
        return callback(null,result);
    });
};

exports.getAllRecords=function (record,callback) {

    Fleet.find({'_type':'Fleet'},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};