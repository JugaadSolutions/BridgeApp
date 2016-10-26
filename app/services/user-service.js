/**
 * Created by root on 16/10/16.
 */

var Messages = require('../core/messages'),
    _ = require('underscore'),
    jwt = require('jsonwebtoken'),
    config = require('config'),
    User = require('../models/user');

exports.loginUser = function (loginData, callback) {

    var username = loginData.username;
    var password = loginData.password;

    if (!username || !password) {
        var invalidInputError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
        invalidInputError.name = "UserError";
        return callback(invalidInputError, null);
    }
/*    if(username!='admin@mytrintrin.com') {
        Member.findOne({emailAddress: username}, function (err, data) {
            if (err) {
                return memId = '';
            }
            memId = data._id;
        });
    }*/
    User.findOne({$or: [{phoneNumber: username}, {email: username}]}, function (err, record) {

        var Id = record._id;
        var Role = record._type;
        if (err) {
            return callback(err, null);
        }

        if (!record) {
            var noUserError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
            noUserError.name = "UserError";
            return callback(noUserError, null);
        }

        if (!record.emailVerified) {
            return callback(new Error(Messages.YOUR_EMAIL_IS_NOT_YET_VERIFIED_PLEASE_VERIFY_BEFORE_LOGGING_IN), null);
        }

        record.comparePassword(password, function (err, isMatch) {

            if (err || !isMatch) {
                var incorrectCredentialsError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
                incorrectCredentialsError.name = "UserError";
                return callback(incorrectCredentialsError, null);
            }

            record.userId = record._id;
            record = _.pick(record, 'email', '_type', 'phoneNumber', 'userID', 'createdAt');



            var TOKEN_EXPIRATION_HOURS = config.get("security.tokenExpiryHours");
            var TOKEN_EXPIRATION_MINUTES = 60 * TOKEN_EXPIRATION_HOURS;
            var TOKEN_EXPIRATION_TIME = 60 * TOKEN_EXPIRATION_MINUTES;

            var token = jwt.sign(record, config.get('security.secret'), {expiresIn: TOKEN_EXPIRATION_TIME});

            var tokenData = {
                token: token,
                expiresIn: TOKEN_EXPIRATION_TIME,
                id:Id,
                role:Role
            };

            return callback(null, tokenData);

        });

    });

};
