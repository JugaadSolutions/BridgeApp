/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Constants = require('../core/constants'),
    Schema = mongoose.Schema;

var vehicleIds={
    vehicleid:{type:Schema.ObjectId,required:false,ref:'vehicle'},
    vehicleUid:{type:Number,required:false}
};

const portStats = Constants.AvailabilityStatus;

var schema = {
    PortID : Number,
    _type:{type:String,required:false},
    StationId:{type:Schema.ObjectId, required:false},
    FPGA:{type:Number,required:false},
    ePortNumber:{type:Number,required:false},
    DockingStationName:{type:String,required:false},
    vehicleId:{type:[vehicleIds], required:false,default:[]},
    portCapacity:{type:Number,required:false,default:1},
    portStatus:{type:portStats,required:true,default:Constants.AvailabilityStatus.EMPTY},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};

var model = new Schema(schema);
model.plugin(abstract);
var Ports = mongoose.model('port', model, 'ports');
module.exports = Ports;