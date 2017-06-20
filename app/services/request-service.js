
 var config = require('config');
var req = require('request');
//var MemberService = require('../services/member-service');

//var //EncryptionService = require('./encryption-service'),

 var Messages = require('../core/messages'),
    EventLoggersHandler = require('../handlers/event-loggers-handler');

exports.requestHandler = function (httpMethod, uri, requestBody,callback) {

    EventLoggersHandler.logger.info(Messages.SENDING_REQUEST_TO_SERVER_BRIDGE + "URI: " + uri);

    //requestBody = EncryptionService.encrypt(requestBody);

    req(
        {
            method: httpMethod,
            baseUrl: config.get('serverBridge.baseUrl'),
            uri: uri,
            json: true,
            body:requestBody
        }
        , function (error, response, body) {

            if (error) {
                tryWan(httpMethod,uri,requestBody,function (err,result) {
                    if(err)
                    {
                        return console.error('Error : Unable to reach Second server');
                    }
                    return callback(null,result);
                });
               // EventLoggersHandler.logger.error(error);
               // return console.error('Error : Unable to reach server');
            }

            if (body) {
                if (body.description) {
                    EventLoggersHandler.logger.info("Response from Admin API: " + body.description);
                }
                return callback(null,body.data);
            }

        }
    )
};

function tryWan(httpMethod,uri,requestBody,callback) {
    req(
        {
            method: httpMethod,
            baseUrl: config.get('serverBridge.fallbackUrl'),
            uri: uri,
            json: true,
            body:requestBody
        }
        , function (error, response, body) {

            if (error) {
                // EventLoggersHandler.logger.error(error);
                return console.error('Error : Unable to reach server');
            }

            if (body) {
                if (body.description) {
                    EventLoggersHandler.logger.info("Response from Admin API: " + body.description);
                }
                return callback(null,body.data);
            }

        }
    )
}