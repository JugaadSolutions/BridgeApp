/**
 * Created by kiranniranjan on 5/11/16.
 */

// Third Party Dependencies
var mongoose = require('mongoose'),
    uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract'),
    Constants = require('../core/constants');

// Mongoose Schema
var Schema = mongoose.Schema;

const MembershipStatus = Constants.MembershipStatus;

// Model
var schema = {

    //membershipId: {type: String, required: false, unique: true, default: uuid.v4()},

    subscriptionType: {type: String, required: true},
    validity: {type: Number, required: true},

    userFees: {type: Number, required: true},
    securityDeposit: {type: Number, required: true},
    smartCardFees: {type: Number, required: true},
    processingFees: {type: Number, required: true},

    farePlan: {type: Schema.ObjectId, required: true, ref: "FarePlan"},

    status: {type: MembershipStatus, required: true, default: MembershipStatus.ACTIVE}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Hooks
/*model.pre('save', function (next) {

    var doc = this;

    if (doc.isNew) {

        doc.membershipId = uuid.v4();

    }

    next();

});*/

// Mongoose Model
var Membership = mongoose.model('Membership', model, 'membership');

module.exports = Membership;