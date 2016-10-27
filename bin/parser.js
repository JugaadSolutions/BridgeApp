//var q = require('./queue');
var Messages = require('../app/core/messages'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler');


exports.packetParser=function (message,callback) {
    message = message.toUpperCase();

    EventLoggersHandler.logger.debug("Step " + message.slice(1, 2) + " " + Messages.LOCAL_BRIDGE_RECEIVED + " " + message + " " + "from Hardware");



    //Generic validation
    if (!message.includes('/') || !message.endsWith('~')) {

        // for now just log it
        console.log("It looks like that's an invalid data packet. Packet Start or End indicator bytes are invalid");
        //TODO modify the data packet - ie add a proper error code or indication code.
        //return responseToClient(null, message, clientHost, clientPort);
        return callback(new Error(message));
    }

    var startingIndex = message.indexOf('/'),
        endingIndex = message.lastIndexOf('~');

    var dataFrame = message.slice(startingIndex, endingIndex + 1);
    EventLoggersHandler.logger.info('From FPGA : '+dataFrame);

    var packetInfo={
        stepNo:Number(dataFrame[1]),
        FPGA:Number(dataFrame.slice(2,4)),
        ePortNumber:Number(dataFrame[4]),
        data:dataFrame
    };

    //console.log(packetInfo);
    callback(null,packetInfo);

};
