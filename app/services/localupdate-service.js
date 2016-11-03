/**
 * Created by root on 1/11/16.
 */
var async = require('async'),
    User = require('../models/user');


exports.updateDB = function (record,cb) {

console.log('Update rec : '+JSON.stringify(record));

    async.series([
        function(callback)
        {
            User.findOne({'smartCardNumber':record.userId}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }

                return callback(null,result);
            });
        }


    ],function (err,result) {
        if(err)
        {
            return cb(err,null);
        }
        return cb(null,result);
    })

};