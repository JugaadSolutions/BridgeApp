/**
 * Created by green on 26/10/16.
 */


//var Stations = require('../app/models/station'),
    //async = require('async'),

  var  Ports = require('../app/models/port'),

    config = require('config');
/*exports.getPorts = function (callback) {

    Stations.findOne({'name': config.get('stationName')},function (err, res) {
        if (err) {
            console.log('Station error');
            return callback(err,null);
        }
        //return callback(null,result);
        Ports.find({'StationId': res._id}).deepPopulate('vehicleId.vehicleid').lean().exec(function (err, result) {
            if (err) {
                console.log('Port error');
                return callback(err,null);
            }
            return callback(null,result);
        });
    });

};*/
exports.getPorts = function (callback) {

/*    Stations.find({},function (err, res) {
        if (err) {
            console.log('Station error');
            return callback(err,null);
        }
        //return callback(null,result);
        if(res.)
        {

        }*/
        Ports.find({/*'StationId': res._id*/}).deepPopulate('vehicleId.vehicleid').lean().exec(function (err, result) {
            if (err) {
                console.log('Port error');
                return callback(err,null);
            }
            return callback(null,result);
        });
  //  });

};

//exports.Ports = getPorts;

