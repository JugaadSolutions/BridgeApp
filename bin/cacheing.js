var ports = require('./Ports');
//var membership = require('./MembershipPlans');
var async = require('async');
const NodeCache = require( 'node-cache' );
const myCache = new NodeCache();

var portDetails;
async.series([

function(callback)
{
    ports.getPorts(function (err,result) {
        if(err)
        {
            console.log('error - '+err);
        }
        portDetails=result;
        console.log(result);
        return callback(null,result);
    });
},
    function () {
        for (var i=0;i<portDetails.length;i++)
        {
            var details = portDetails[i];
            var key = details._doc.FPGA.toString()+details._doc.ePortNumber.toString();
            var obj = { 'PortID': details.PortID, 'portCapacity': details.portCapacity ,vehicleId:details.vehicleId};
            var j=1;
            myCache.set( 'key', obj, function( err, success ){
                if(err)
                {
                    console.log('Error');
                }
                console.log('Success :'+success);
            });
        }
    }

],function (err,result) {
    if (err)
    {
        console.log('Error :'+err);
    }
    console.log('Cacheing successful');
});




/*
membership.getMembershipPlans(function (err,result) {
    if(err)
    {
        console.log('error - '+err);
    }

    /!* console.log(result);
     console.log(result[0].farePlan.plans[0].startTime);
     console.log(result[0].farePlan.plans[0].endTime);
     console.log(result[0].farePlan.plans[0].fee);*!/
});
*/


