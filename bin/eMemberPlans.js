/**
 * Created by root on 27/10/16.
 */
var async = require('async'),
    memberShipPlans = require('./MembershipPlans');

var mPlans;
var memberPlans=[];

async.series([
    function (callback) {
        memberShipPlans.getMembershipPlans(function (err,result) {
            if(err)
            {
                console.log('Error getting Membership Plans');
                return callback(err,null);
            }
            mPlans=result;
            return callback(null,result);
        });
    },
    function (callback) {
        for(var i=0;i<mPlans.length;i++)
        {
            var data = mPlans[i];
            var planDetails={
                subscriptionType:data.subscriptionType,
                validity:data.validity,
                userFees:data.userFees,
                plans:data.farePlan.plans
            };
            memberPlans.push(planDetails);
        }
        return callback(null,memberPlans);
    }

],function (err,result) {
    if(err) {
        console.log('Error in getting MemberShip Plans');
    }
    //console.log(JSON.stringify(memberPlans));
    console.log('Plans Fetched successfully');
});

module.exports=memberPlans;



