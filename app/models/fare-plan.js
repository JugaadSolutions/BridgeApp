/**
 * Created by kiranniranjan on 5/25/16.
 */

// Third Party Dependencies
var mongoose = require('mongoose'),
    uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract'),
    Constants = require('../core/constants');

// Mongoose Schema
var Schema = mongoose.Schema;

const FarePlanStatus = Constants.FarePlanStatus;

// Nested model
var Plans = {
    startTime: {type: Number, required: true},
    endTime: {type: Number, required: true},
    fee: {type: Number, required: true}
};

// Model
var schema = {

    //farePlanId: {type: String, required: false, unique: true, default: uuid.v4()},

    planName: {type: String, required: true, unique: true},
    plans: {type: [Plans], required: true},

    status: {type: FarePlanStatus, required: true, default: FarePlanStatus.ACTIVE}

};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Hooks
/*model.pre('save', function (next) {

    var doc = this;

    if (doc.isNew) {

        doc.farePlanId = uuid.v4();

    }

    next();

});*/

// Mongoose Model
var FarePlan = mongoose.model('FarePlan', model, 'fare-plan');

module.exports = FarePlan;