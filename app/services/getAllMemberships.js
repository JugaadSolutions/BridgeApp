var Membership = require('../models/membership');
exports.getMembershipPlans = function(callback)
{
    Membership.find({}).populate('farePlan').lean().exec(function(err,result)
    {
        if(err)
        {
            return callback(err,null);

        }
        return callback(null,result);
    });

};