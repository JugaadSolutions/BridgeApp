//var q = require('./queue');
var Messages = require('../app/core/messages'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler');


exports.packetParser=function (UDPPacketInfo,callback) {
    UDPPacketInfo.message = UDPPacketInfo.message.toUpperCase();

    EventLoggersHandler.logger.debug("Step " + UDPPacketInfo.message.slice(1, 2) + " " + Messages.LOCAL_BRIDGE_RECEIVED + " " + UDPPacketInfo.message + " " + "from Hardware");



    //Generic validation
    if (!UDPPacketInfo.message.includes('/') || !UDPPacketInfo.message.endsWith('~')) {

        // for now just log it
        console.log("It looks like that's an invalid data packet. Packet Start or End indicator bytes are invalid");
        //TODO modify the data packet - ie add a proper error code or indication code.
        //return responseToClient(null, message, clientHost, clientPort);
        return callback(new Error(UDPPacketInfo.message),null);
    }

    var startingIndex = UDPPacketInfo.message.indexOf('/'),
        endingIndex = UDPPacketInfo.message.lastIndexOf('~');

    var dataFrame = UDPPacketInfo.message.slice(startingIndex, endingIndex + 1);
    EventLoggersHandler.logger.info('Step ' + UDPPacketInfo.message.slice(1, 2) + ' Received Packet from-'
        + UDPPacketInfo.clientHost +':'+UDPPacketInfo.clientPort +"  " +dataFrame);

    if(dataFrame[1]!=='1' && dataFrame[1]!=='3' && dataFrame[1]!=='6' && dataFrame[1]!=='7' && dataFrame[1]!=='9' )
    {
        return callback(new Error('Its look like new STEP NUMBER is entered to the system from Hardware. Please check the step number '+dataFrame[1]),null);
    }

    var packetInfo={
        stepNo:Number(dataFrame[1]),
        FPGA:Number(dataFrame.slice(2,4)),
        ePortNumber:Number(dataFrame[4]),
        data:dataFrame,
        clientHost:UDPPacketInfo.clientHost,
        clientPort:UDPPacketInfo.clientPort
    };

    //console.log(packetInfo);
    callback(null,packetInfo);

};
