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
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false}

};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var CheckIn = mongoose.model('CheckIn', model, 'checkin');


module.exports = CheckIn;
