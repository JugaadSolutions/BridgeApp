var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
    //Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var EmployeeSchema = require('mongoose').model('user').schema.extend({
employeeId:{type:String,required:false,unique:true}
});

var Employee = mongoose.model('employee', EmployeeSchema);


module.exports=Employee;