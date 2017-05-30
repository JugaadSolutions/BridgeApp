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

    user: {type: Number, required: false},
    vehicleId: {type: Number, required: true},
    fromPort: {type: Number, required: true},// ref: 'DockingPort'},
    checkOutTime: {type: Date, required: false,default: Date.now},
    duration:{type: Number, required: false,default:0},
    status: {type: String, required: true,default:'Open'},
    errorStatus:{type: Number, required: false,default:0},
    localUpdate:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false},
    checkOutInitiatedTime: {type: Date, required: false},
    checkOutCompletionTime: {type: Date, required: false},
    peerGroup:{type:[],required:false,default:[]},
    localEntry:{type:Boolean,required:false,default:false}
};

var model = new Schema(schema);

model.index({ user: 1, vehicleId: 1, fromPort:1,checkOutTime:1}, { unique: true });
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