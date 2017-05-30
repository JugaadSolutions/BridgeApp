/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Schema = mongoose.Schema;

var schema = {
    membershipId:{type: Number, required: false},
    userFees:{type:Number,required:false},
    securityDeposit:{type:Number,required:false},
    processingFees:{type:Number,required:false},
    smartCardFees:{type:Number,required:false},
    status:{type:Number,required:false},
    farePlan:{type:Schema.ObjectId,required:false,ref:'fareplan'},
    validity:{type: Number, required: false},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};
var model = new Schema(schema);
model.plugin(abstract);
var Membership = mongoose.model('membership', model, 'membership');
module.exports = Membership;
