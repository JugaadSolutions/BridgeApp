/**
 * Created by root on 5/10/16.
 */
require('./index');
require('./user');
require('./port');
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
Constants = require('../core/constants');
//Messages = require('../core/messages'),
//ValidationHandler = require('../handlers/validation-handler');
//var autoIncrement = require('mongoose-auto-increment');

var status = Constants.VehicleStatus;
var vtype = Constants.VehicleType;
var currentStatus = Constants.VehicleLocationStatus;

/*const AssociationIds = {
    AssociationId : {type:Schema.ObjectId,required:false,ref:'user'||'port'}
    // noOfVehicle :{type:Number,required:false}
};*/

var VehicleSchema = mongoose.Schema({
    fleetId:{type:Schema.ObjectId,required:true,ref:'Fleet'},
    vehicleNumber:{type:String,required:true,unique:true},//ref:'User'},
    vehicleRFID: {type: String, required: true,unique:true}, //ref: 'Bicycle'},
    vehicleType:{type:vtype,required:true, default:vtype.BICYCLE},
    vehicleStatus:{type:status,required:true,default:status.OPERATIONAL},
    vehicleCurrentStatus:{type:currentStatus,required:true,default:currentStatus.WITH_PORT},
    /*currentAssociationId:{type:[AssociationIds], required:false,default:[]}*/
    currentAssociationId:{type:Schema.ObjectId, required:false,ref:'port'||'user'}

}, { collection : 'vehicles'});


var Vehicle = mongoose.model('vehicle', VehicleSchema);

VehicleSchema.plugin(abstract);

module.exports = Vehicle;


/*

// Third Party Dependencies
var mongoose = require('mongoose'),
extend = require('mongoose-schema-extend');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract');
var Constants = require('../core/constants');

// Mongoose Schema
var Schema = mongoose.Schema;

var status = Constants.VehicleStatus;
var vtype = Constants.VehicleType;
var currentStatus = Constants.VehicleLocationStatus;

/!*
const AssociationIds = {
    AssociationId : {type:Schema.ObjectId,required:false,ref:'User'||'Port'}
    // noOfVehicle :{type:Number,required:false}
};
*!/

/!*
const Maintenance = {
    lastMaintainedDate: {type: Date, required: true},
    employeeId: {type: Schema.ObjectId, required: true, ref: 'Employee'}
};

const Repair = {
    lastRepairedDate: {type: Date, required: true},
    employeeId: {type: Schema.ObjectId, required: true, ref: 'Employee'}
};*!/


var schema = {
    fleetId:{type:Schema.ObjectId,required:true},
    vehicleNumber:{type:String,required:true,unique:true},//ref:'User'},
    vehicleRFID: {type: String, required: true,unique:true}, //ref: 'Bicycle'},
    vehicleType:{type:vtype,required:true, default:vtype.BICYCLE},
    vehicleStatus:{type:status,required:true,default:status.OPERATIONAL},
    vehicleCurrentStatus:{type:currentStatus,required:true,default:currentStatus.WITH_PORT},
    currentAssociationId:{type:Schema.ObjectId, required:false , ref:'user'||'port'}
    //maintenanceDetails: {type: [Maintenance], required: false},
    //repairDetails: {type: [Repair], required: false}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var Vehicle = mongoose.model('Vehicle', model, 'vehicle');

module.exports = Vehicle;
*/
