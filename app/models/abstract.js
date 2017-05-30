// Third party dependencies
var _ = require('underscore'),
    mongoose = require('mongoose'),
    paginate = require('mongoose-paginate'),
    uniqueValidator = require('mongoose-unique-validator'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

// Application level dependencies
//var Messages = require('../core/messages');

//abstract
module.exports = exports = function auditPlugin(schema, options) {

    schema.add({lastModifiedAt: Date});
    schema.add({createdAt: Date});
    schema.add({description: String});

    schema.plugin(uniqueValidator, {message: 'Duplicate Entry'});
    schema.plugin(paginate);
    schema.plugin(deepPopulate);

    schema.pre('save', function (next) {

        if (this.isNew) {
            this.createdAt = new Date();
        }
  //      this.lastModifiedAt = new Date();

        next();

    });
    schema.set('toJSON', {

        transform: function (doc, ret, options) {

            ret.id = ret._id;
            return _.omit(ret, ['__v', 'createdAt', 'lastModifiedAt', 'password', 'token', 'tokenExpiryTime', 'disabled', 'movementHistory']);

        }

    });

};