/**
 * Created by root on 21/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Station = require('../models/station'),
    Schema = mongoose.Schema;

var vehicleIds={
    vehicleid:{type:Schema.ObjectId,required:false,ref:'vehicle'},
    vehicleUid:{type:Number,required:false}
};

var schema = {
    _type: {type: String, required: false},
    UserID: {type: Number, required: false, unique:true},
    smartCardKey: {type: String, required: false},
    status:{type: Number, required: false},
    cardNum:{type: Number, required: false},
    smartCardNumber:{type: String, required: false},
    creditBalance:{type: Number, required: false},
    membershipId:{type: Schema.ObjectId, required: false},
    validity:{type: Date, required: false},
    vehicleId:{type:[vehicleIds], required:false,default:[]},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};
var model = new Schema(schema);
model.plugin(abstract);
var User = mongoose.model('users', model, 'users');

module.exports = User;