var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var HoldingAreaSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true}

});

var HoldingArea = mongoose.model('holdingarea', HoldingAreaSchema);


module.exports=HoldingArea;