var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var RedistributionPortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'Station'}

});

var RedistributionPort = mongoose.model('Redistribution-area', RedistributionPortSchema);


module.exports=RedistributionPort;