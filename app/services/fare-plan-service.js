/**
 * Created by root on 8/10/16.
 */
var FarePlan = require('../models/fare-plan');


exports.calculateFarePlan = function (id, duration, callback) {

    var fee;

    FarePlan.findById(id, function (err, result) {

        if (err) {
            return callback(err, null);
        }

        fee = 250;
        for (var i = 0; i < result.plans.length; i++) {

            if (duration <= result.plans[i].endTime) {
                fee = result.plans[i].fee;
                break;
            }

        }
        return callback(null, fee);
    });

};