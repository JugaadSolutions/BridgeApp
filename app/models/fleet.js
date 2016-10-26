// Third Party Dependencies
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
/*
var uuid = require('node-uuid'),
    _ = require('underscore');
*/

// Application Level Dependencies
//var abstract = require('./abstract');
var Constants = require('../core/constants');
  //  config = require('config');


// Mongoose Schema
var Schema = mongoose.Schema;

var FleetStatus = Constants.FleetStatus;
//var name = config.get('fleet.mysore.name');
const VehicleIds = {
  vehicleId : {type:Schema.ObjectId,required:false,ref:'Vehicle'}
   // noOfVehicle :{type:Number,required:false}
};


var FleetPortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'Station'},
    vehicles: {type: [VehicleIds], required: false, default:[]},
    timeStamp: {type: Date, required: false, default:Date.now()},
    status:{type:FleetStatus,required:true,default:FleetStatus.WORKING},
    //fleetName:{type:String, required:true},
    VehicleCapacity:{type:Number,required:false,default:0}

});

var Fleet = mongoose.model('Fleet', FleetPortSchema);


module.exports=Fleet;

/*var schema = {
    //member:{type:String,required:true},//ref:'User'},
    vehicles: {type: [VehicleIds], required: false, default:[]},
    timeStamp: {type: Date, required: false, default:Date.now()},
    status:{type:FleetStatus,required:true,default:FleetStatus.WORKING},
    fleetName:{type:String, required:true},
    VehicleCapacity:{type:Number,required:false,default:0}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var Fleet = mongoose.model('Fleet', model, 'fleet');

module.exports = Fleet;*/
