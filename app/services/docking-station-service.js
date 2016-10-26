/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async')
    /*config = require('config'),
    request = require('request')*/;
var DockStation=require('../models/dock-station'),
    DockPort= require('../models/dock-port');

var DockService = require('../services/docking-port-service');
// Application Level Dependencies
/*var DockingStation = require('../models/docking-station'),
    Member = require('../models/user'),
    Vehicle = require('../models/vehicle'),
    DockingUnit = require('../models/docking-unit'),
    DockingPort = require('../models/docking-port'),

    DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    Messages = require('../core/messages');*/

// Method to create docking station
/*
exports.createStation = function (record, callback) {

    var dockingStation;
    var dockingStationObject;

    async.series([

            // Step 1: Method to create docking station
            function (callback) {

               /!* var newRecord = DockingStation(record);

                newRecord.save(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    dockingStationObject = {
                        stationNumber: result.stationNumber,
                        name: result.name,
                        stationIPAddress: result.ipAddress,
                        ipAddress: [],
                        serverReferenceId: result._id,
                        dockingStationId: result._id,
                        status: result.status
                    };

                    dockingStation = result;
                    return callback(null, result);

                });*!/

                dockingStationObject = {
                    stationNumber: record.stationNumber,
                    name: record.name
                    /!*stationIPAddress: result.ipAddress,
                    ipAddress: [],
                    serverReferenceId: result._id,
                    dockingStationId: result._id,
                    status: result.status*!/
                };
                DockingStation.create(dockingStationObject,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    dockingStation=result;
                    return callback(null,result);
                });

            }/!*,

            // Step 2: Method to update local bridges
            function (callback) {

                var httpMethod = 'POST',
                    uri = 'dockingstation';

                RequestHandler.updateLocalBridges(dockingStationObject, httpMethod, uri);
                return callback(null, null);

            }*!/
        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, dockingStation);

        });

};*/


exports.createDS = function (record,callback) {
    var stationDetails;
    var stationDetailsUpdated;
    var portInfo=[];
    
    async.series([
        function (callback) {
            DockStation.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                stationDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            var j=1;
            for(var i=0;i<stationDetails.noofPorts;i++)
            {
                if(j>4)
                {
                    j=1;
                }
                var portsDetails={
                    StationId:stationDetails._id,
                    FPGA:j,
                    Name:stationDetails.name+"- PORT -"+j
                };

                DockService.createPort(portsDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }

                    /* DockStation.findById(stationDetails._id,function (err,rec) {
                     if(err)
                     {
                     return callback(err,null);
                     }*/

                    var portInfo={
                        dockingPortId:result._id
                    };
                    stationDetails.portIds.push(portInfo);
                    DockStation.findByIdAndUpdate(stationDetails._id,stationDetails,function (err,records) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        //stationDetails=records;
                        stationDetailsUpdated=records;
                        // return callback(null,records);
                    });

                    //});
                });
                j=j+1;
            }
            callback(null,null);
        }/*,
         function (callback) {


         }*/
        
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,stationDetailsUpdated);
    });


};




















