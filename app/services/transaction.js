/**
 * Created by root on 15/6/17.
 */
var async = require('async');
var Checkout = require('../models/checkout');
var Checkin = require('../models/checkin');

exports.clearAll = function (callback) {
    async.series([
        function (callback) {
            Checkout.remove({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Checkin.remove({},function (err,result) {
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
            return callback(err,null);
        }
        return callback(null,"All cleared");
    });
};