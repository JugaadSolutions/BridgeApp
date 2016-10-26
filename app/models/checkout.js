// Third Party Dependencies
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
/*var uuid = require('node-uuid'),
    _ = require('underscore');*/

// Application Level Dependencies
var abstract = require('./abstract');
    //Constants = require('../core/constants');

//var checkoutstatus = Constants.CheckOutInStatus;

// Mongoose Schema
var Schema = mongoose.Schema;
var schema = {

    user: {type: Schema.ObjectId, required: false, ref: 'user'},
    vehicleId: {type: Schema.ObjectId, required: true, ref: 'vehicle'},
    fromPort: {type: Schema.ObjectId, required: true,ref:'port'},// ref: 'DockingPort'},
    checkOutTime: {type: Date, required: false},
    status: {type: String, required: true,default:'Open'},
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var CheckOut = mongoose.model('CheckOut', model, 'checkout');
/*var check = new CheckOut({
    member:'asdf',
    bicycle:'qwer',
    fromPort:'tyui',
    status:'trt',
    errormsg:'lkjk'
});
check.save(function (error) {
    console.log("Your check has been saved!");
    if (error) {
            console.error(error);
          }
});*/

module.exports = CheckOut;