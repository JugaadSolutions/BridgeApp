var jwt = require('jsonwebtoken'),
    _ = require('underscore'),
    ACL = require('../models/masters/acl');

exports.fetchUserInfoFromRequestObject = function () {

    return function (req, res, next) {

        var username = 'none';

        if (!req.user) {
            var decoded = jwt.decode(fetchHeader(req.headers));

            if (decoded) {
                req.user = decoded;
                username = decoded.username;
            }
        } else {
            username = req.user.username;
        }

        if (req.method == 'POST') {

            req.body.createdBy = username;
            req.body.createdAt = new Date();
            req.body.lastModifiedBy = username;
            req.body.lastModifiedAt = new Date();

        } else if (req.method == 'PUT') {

            req.body.lastModifiedBy = username;
            req.body.lastModifiedAt = new Date();

        }

        next();

    };

};

exports.checkWhitelist = function (req) {

    var whiteListedUrls = ['/api/auth/login'];

    for (var i = 0; i < whiteListedUrls.length; i++) {

        if (req.originalUrl.indexOf(whiteListedUrls[i]) > -1) {
            return true;
        }

    }

    return false;

};

exports.authorizeUser = function () {

    return function (req, res, next) {

        var urlArray = req.baseUrl.split('/');
        var resource = urlArray[2];

        if (exports.checkWhitelist(req)) {
            return next();
        }

        if (!req.user || !req.user.role) {
            return next({
                errorCode: 401,
                status: 401,
                message: 'Unauthenticated user!',
                name: 'UnauthorizedError'
            }, req, res, next);
        }

        isAccessAllowed(req.user.role, resource, getAction(req.method), function (status) {

            if (!status) {
                return next({
                    errorCode: 403,
                    name: 'AccessError',
                    status: 403,
                    message: 'Forbidden access!'
                }, req, res, next);
            }

            return next();

        });

    };

};

// TODO: Optimise this by loading permissions when app starts!
const isAccessAllowed = function (role, resource, action, callback) {

    if (!role || !resource || !action) {
        return callback(false);
    }

    ACL.findOne({role: role}, function (err, result) {

        if (err || !result) {
            return callback(false);
        }

        var data = result.toObject();

        if (_.contains(data.resources, "all") && _.contains(data.actions, "all")) {
            return callback(true);
        }

        if (_.contains(data.resources, "all") && _.contains(data.actions, action)) {
            return callback(true);
        }

        if (_.contains(data.resources, resource) && _.contains(data.actions, action)) {
            return callback(true);
        }

        return callback(false);

    });

};

const getAction = function (method) {

    switch (method.toLowerCase()) {

        case 'get':
            return 'view';
        case 'post':
            return 'add';
        case 'put':
            return 'edit';
        case 'patch':
            return 'edit';
        case 'delete':
            return 'delete';
        default:
            return 'view';

    }

};

const fetchHeader = function (headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');
        if (part.length === 2) {
            return part[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};