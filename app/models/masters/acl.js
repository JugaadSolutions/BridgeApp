// Third Party Dependencies
var mongoose = require('mongoose');

// Application Level Dependencies
var abstract = require('../abstract'),
    Messages = require('../../core/messages');

// Mongoose Schema
var Schema = mongoose.Schema;

// Model
var schema = {
    role: {type: String, required: true},
    resources: {type: [String], required: true},
    actions: {type: [String], required: true}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var ACL = mongoose.model('AccessControl', model, 'access-control');

// Model Methods
ACL.count({}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITISE_THE_ACL_COLLECTION + err);
    }

    if (count < 1) {

        var defaults = [
            {
                "role": "admin",
                "resources": ["all"],
                "actions": ["all"]
            }
        ];

        ACL.create(defaults, function (err, result) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_ACL_DATA + err);
            }

            console.log(result);

        });
    }

});

module.exports = ACL;