/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Constants = require('../core/constants'),
    Schema = mongoose.Schema;

const FarePlanStatus = Constants.FarePlanStatus;

var Plans = {
    startTime: {type: Number, required: true},
    endTime: {type: Number, required: true},
    fee: {type: Number, required: true}
};

var schema = {
    fareplanUid:Number,
    plans: {type: [Plans], required: true},
    status: {type: FarePlanStatus, required: true, default: FarePlanStatus.ACTIVE},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};

var model = new Schema(schema);
model.plugin(abstract);
var Fareplan = mongoose.model('fareplan', model, 'fare-plan');
module.exports = Fareplan;
