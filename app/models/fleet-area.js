var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var FleetAreaSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true}

});

var FleetArea = mongoose.model('fleet-area', FleetAreaSchema);


module.exports=FleetArea;