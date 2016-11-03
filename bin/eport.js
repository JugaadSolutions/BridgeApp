
var async = require('async'),
    ports = require('./Ports');

var Constants = require('../app/core/constants');

var port;
var eport=[];

async.series([
    function (callback) {
        ports.getPorts(function (err,result) {
            if(err)
            {
                console.log('Error getting ports');
                return callback(err,null);
            }
            port=result;
            return callback(null,result);
        });
    },
    function (callback) {

        for(var i=0;i<port.length;i++)
        {
            var data = port[i];
            if(data.vehicleId.length>0) {
                var eportDetails = {
                    portStatus: data.portStatus,
                    PortID: data.PortID,
                    portCapacity: data.portCapacity,
                    FPGA:data.FPGA,
                    ePortNumber:data.ePortNumber,
                    vehicleRFId: data.vehicleId[0].vehicleid,
                    vehicleUid: data.vehicleId[0].vehicleUid,
                    lockStatus: Constants.LockStatus.NORMAL,
                    LEDIndication:0,
                    clientHost:'',
                    clientPort:''
                };
            }
            else
            {
                var eportDetails = {
                    portStatus: data.portStatus,
                    PortID: data.PortID,
                    portCapacity: data.portCapacity,
                    FPGA:data.FPGA,
                    ePortNumber:data.ePortNumber,
                    vehicleRFID: '',
                    vehicleUid: '',
                    lockStatus: Constants.LockStatus.NORMAL,
                    LEDIndication:0,
                    clientHost:'',
                    clientPort:''
                };
            }
            eport.push(eportDetails);
        }

        return callback(null,eport);
    }
],function (err,result) {
    if(err)
    {
        console.log('Error in ports');
    }
    //console.log(eport);
    console.log('Ports Fetched successfully');
});

/*exports.printIt=function (callback) {
    console.log('Print It : ');
    return callback('Print It...................');
};*/


module.exports=eport;
/*
exports.printIt=function (callback) {
    console.log('Print It : '+eport);
    return callback(eport);
};
*/
