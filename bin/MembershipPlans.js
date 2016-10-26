/**
 * Created by green on 26/10/16.
 */
require('../app/models/fare-plan');
var Membership = require('../app/models/membership');

exports.getMembershipPlans=function (callback) {
    Membership.find({}).deepPopulate('farePlan plans').lean().exec(function(err,result)
    {
        if(err)
        {
            return callback(err,null);

        }
        return callback(null,result);
    });
};
