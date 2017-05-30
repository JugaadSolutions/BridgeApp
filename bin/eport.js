
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
                    UserID:'',
                    cardRFID:'',
                    portCapacity: data.portCapacity,
                    FPGA:data.FPGA,
                    ePortNumber:data.ePortNumber,
                    vehicleid: data.vehicleId[data.vehicleId.length-1].vehicleid,
                    vehicleRFID:data.vehicleId[data.vehicleId.length-1].vehicleid.vehicleRFID,
                    vehicleUid: data.vehicleId[data.vehicleId.length-1].vehicleUid,
                    lockStatus: Constants.LockStatus.NORMAL,
                    LEDIndication:0,
                    clientHost:'',
                    clientPort:'',
                    checkOutInitiatedTime:'',
                    checkOutCompletionTime:''
                };
                console.log('FPGA : '+eportDetails.FPGA);
                console.log('PortNumber : '+eportDetails.ePortNumber);
                console.log('PortStatus : '+eportDetails.portStatus);
                console.log('VehicleRFID : '+eportDetails.vehicleRFID);
            }
            else
            {
                var eportDetails = {
                    portStatus: data.portStatus,
                    PortID: data.PortID,
                    UserID:'',
                    cardRFID:'',
                    portCapacity: data.portCapacity,
                    FPGA:data.FPGA,
                    ePortNumber:data.ePortNumber,
                    vehicleid:'',
                    vehicleRFID: '',
                    vehicleUid: '',
                    lockStatus: Constants.LockStatus.NORMAL,
                    LEDIndication:0,
                    clientHost:'',
                    clientPort:'',
                    checkOutInitiatedTime:'',
                    checkOutCompletionTime:''
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
