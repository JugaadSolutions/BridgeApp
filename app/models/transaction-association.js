// Third Party Dependencies
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract');
//Constants = require('../core/constants');

//var checkoutstatus = Constants.CheckOutInStatus;

// Mongoose Schema
var Schema = mongoose.Schema;
var schema = {

    checkInEntry: {type: Schema.ObjectId, required: true},// ref: 'Member'},
    checkOutEntry: {type: Schema.ObjectId, required: true}

};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var TransactionAssociation = mongoose.model('TransactionAssociation', model, 'transaction-association');


module.exports = TransactionAssociation;

