/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Constants = require('../core/constants'),
    Schema = mongoose.Schema;
var currentStatus = Constants.VehicleLocationStatus;
var vtype = Constants.VehicleType;
var status = Constants.OperationStatus;

var schema = {
    vehicleUid: {type:Number,required:false},
    vehicleNumber:{type:String,required:true,unique:true},
    vehicleRFID: {type: String, required: true,unique:true},
    currentAssociationId:{type:Schema.ObjectId, required:false},
    vehicleCurrentStatus:{type:currentStatus,required:true,default:currentStatus.WITH_PORT},
    vehicleType:{type:vtype,required:true, default:vtype.BICYCLE},
    vehicleStatus:{type:status,required:true,default:status.OPERATIONAL},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}

};
var model = new Schema(schema);
model.plugin(abstract);
var Vehicle = mongoose.model('vehicle', model, 'vehicles');
module.exports = Vehicle;