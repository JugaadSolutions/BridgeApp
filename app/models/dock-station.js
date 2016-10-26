require('./station');
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    Constants = require('../core/constants');

const stationStats = Constants.AvailabilityStatus;

const DockingPorts ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'Docking-port'}
};


var DockStationSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    ipAddress:{type:String,required:false,unique:true},
    stationStatus:{type:stationStats,required:false,default:stationStats.EMPTY},
    stationNumber:{type:String,required:false},
    noofUnits:{type:Number,required:false},
    noofPorts:{type:Number,required:false},
    portIds:{type:[DockingPorts],required:false}
    //noOfPorts:{type:Number,required:false}

});

var DockStation = mongoose.model('dock-station', DockStationSchema);


module.exports=DockStation;