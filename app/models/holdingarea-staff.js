/**
 * Created by root on 27/12/16.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const empstat = Constants.EmployeeStatus;

var HoldingareaStaffSchema = require('mongoose').model('user').schema.extend({
    employeeId:{type:String,required:false},
    position:{type:String,required:false},
    experiance:{type:Number,required:false},
    joiningDate:{type:Date,required:false},
    additionalInfo:{type:String,required:false},
    status:{type:empstat,required:false,default:empstat.INACTIVE}
});

var HoldingareaEmployee = mongoose.model('Holdingarea-employee', HoldingareaStaffSchema);


module.exports=HoldingareaEmployee;

