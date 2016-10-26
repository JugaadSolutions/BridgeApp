var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var MaintenancePortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false,ref:'Station'}
});
var MaintenancePort = mongoose.model('Maintenance-area', MaintenancePortSchema);


module.exports=MaintenancePort;