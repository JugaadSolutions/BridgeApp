/**
 * Created by root on 27/12/16.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var MonitorSchema = require('mongoose').model('user').schema.extend({
    status:{type:Number,required:true,default:0}
});

var Monitor= mongoose.model('Monitor-group', MonitorSchema );


module.exports=Monitor;
