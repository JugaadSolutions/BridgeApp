/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Constants = require('../core/constants'),
    Schema = mongoose.Schema;

const status = Constants.OperationStatus;

const DockingPorts ={
    dockingPortId: {type: Schema.ObjectId}
};

var schema = {
    StationID : Number,
    stationType:{type:String,required:false},
    name:{type:String,required:false,unique:true},
    ipAddress:{type:String,required:false,unique:true},
    subnet:{type:Number,required:false,unique:true},
    operationStatus:{type:status,required:false,default:status.OPERATIONAL},
    portIds:{type:[DockingPorts],required:false},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'},
    peerGroup:{type:[],required:false,default:[]}
};
var model = new Schema(schema);
model.plugin(abstract);
var Station = mongoose.model('station', model, 'stations');
module.exports = Station;
