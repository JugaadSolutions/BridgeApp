require('./parser');
require('../bin/pbs-bridge');
var queue = require('block-queue');
var dgram = require('dgram'),
    config = require('config'),
    Messages = require('../app/core/messages'),
   // RequestService = require('../app/services/request-service'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler'),
    udpServer = dgram.createSocket('udp4');

var clientHost, clientPort;
var q = require('./queue');
var p =require('./parser');
var i=0;
udpServer.on('error', function (err) {

    console.log(err);
    // TODO
    //server.close();// no need to close

});

var qu = queue(1, function(task, done) {
    console.log('Message :'+task);
    done();
});

udpServer.on('message', function (message, rinfo) {
    //console.log('Message Received as : '+message);
    //console.log('Address : '+rinfo.address+'Port : '+rinfo.port);

    message = "" + message; // to convert buffer data into string data type
    //message = message.toString('hex');

    message = message.toUpperCase();

    EventLoggersHandler.logger.debug("Step " + message.slice(1, 2) + " " + Messages.LOCAL_BRIDGE_RECEIVED + " " + message + " " + "from Hardware");

    clientHost = rinfo.address;
    clientPort = rinfo.port;

    //Generic validation
    if (!message.includes('/') || !message.endsWith('~')) {

        // for now just log it
        console.log("It looks like that's an invalid data packet. Packet Start or End indicator bytes are invalid");
        //TODO modify the data packet - ie add a proper error code or indication code.
        return responseToClient(null, message, clientHost, clientPort);

    }

    var startingIndex = message.indexOf('/'),
        endingIndex = message.lastIndexOf('~');

    var dataFrame = message.slice(startingIndex, endingIndex + 1);
    EventLoggersHandler.logger.info('From FPGA : '+dataFrame);

    var packetInfo={
        stepNo:Number(dataFrame[1]),
        FPGA:Number(dataFrame.slice(2,4)),
        ePortNumber:Number(dataFrame[4]),
        data:dataFrame.slice(5,endingIndex)
    };

    console.log(packetInfo);
   // qu.push(mess);
/*    q.push(mess);
    console.log(q.length);
    q.shift();
    console.log(q.length);*/
    /*p(q,function (err,result) {
        if(err)
        {
            console.log("error");
        }
        q.shift();
    });*/
    /*q.push(2);
    q.push(3);*/
    /*var i = 4;
    while (q.length > 0) {
        console.log(/!*q.length, *!/q.shift());
        //q.unshift(i++);
        /!*console.log(q.length, q.shift());
        q.push(i++);
        console.log(q.length, q.shift());*!/
    }*/
});


udpServer.on('listening', function () {
    console.log("PBS Bridge listening to requests from Anywhere");
});

udpServer.bind({
    address: config.get("udp.host"),
    port: config.get("udp.port"),
    exclusive: true
});


function responseToClient(err, message, host, port, updateServer) {

    var stepNumber = message[1];
    var portNumber = message[4];
    var ipAddress = config.get('ipAddress');

    if (stepNumber != "8") {
        console.log('To FPGA : '+message);
        EventLoggersHandler.logger.info('To FPGA : '+message);
        udpServer.send(message, 0, message.length, 1024, host, function (err, bytes) {

            if (err) {
                throw err;
            }

            EventLoggersHandler.logger.info("Step " + message.slice(1, 2) + " " + Messages.SENDING_RESPONSE_DATA_PACKET + " " + message);
        });
    }
    if (updateServer) {

        switch (stepNumber) {

            case "4":

                var httpMethod = 'POST',
                    uri = '/member/checkout/success',
                    requestBody = {

                        "clientHost": ipAddress,
                        "clientPort": portNumber,
                        "dataPacket": message
                    };

              //  RequestService.requestHandler(httpMethod, uri, requestBody);

                break;

            case "8":

                var httpMethod = 'POST',
                    uri = '/member/checkin/success',
                    requestBody = {

                        "clientHost": ipAddress,
                        "clientPort": portNumber,
                        "dataPacket": message
                    };

               // RequestService.requestHandler(httpMethod, uri, requestBody);

                break;

        }
    }
}