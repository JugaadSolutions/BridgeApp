require('./index');
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract');
//Constants = require('../core/constants'),
//Messages = require('../core/messages'),
//ValidationHandler = require('../handlers/validation-handler');
var autoIncrement = require('mongoose-auto-increment');


var StationSchema = mongoose.Schema({
    StationID : Number

}, { collection : 'stations', discriminatorKey : 'stationType' });


var Station = mongoose.model('station', StationSchema);

StationSchema.plugin(abstract);

StationSchema.plugin(autoIncrement.plugin,{model:Station,field:'StationID',startAt: 1, incrementBy: 1});


module.exports = Station;