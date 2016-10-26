var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var MaintenanceCenterSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true}

});

var MaintenanceCenter = mongoose.model('maintenance-center', MaintenanceCenterSchema);


module.exports=MaintenanceCenter;