// Third Party Dependencies
var mongoose = require('mongoose');
    /*uuid = require('node-uuid'),
    _ = require('underscore');*/

// Application Level Dependencies
var abstract = require('./abstract');
//Constants = require('../core/constants');

//const checkinstatus = Constants.CheckOutInStatus;

// Mongoose Schema
var Schema = mongoose.Schema;
var schema = {

    user: {type: Number, required: false},
    vehicleId: {type: Number, required: true},
    toPort: {type: Number, required: true},
    checkInTime: {type: Date, required: false,default: Date.now},
    status: {type: String, required: true, default: 'Open'},
    duration:{type: Number, required: false,default:0},
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false},
    reconciled:{type:Number,required:false},
    localUpdate:{type: Number, required: false,default:0},
    peerGroup:{type:[],required:false,default:[]},
    peerUpdate:{type:Boolean,required:false},
    localEntry:{type:Boolean,required:false,default:false}
};

var model = new Schema(schema);

model.index({ vehicleId: 1, toPort:1,checkInTime:1}, { unique: true });
// Plugins
model.plugin(abstract);

// Mongoose Model
var CheckIn = mongoose.model('CheckIn', model, 'checkin');


module.exports = CheckIn;
