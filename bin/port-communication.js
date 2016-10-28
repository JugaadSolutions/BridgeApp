require('./parser');
require('../bin/pbs-bridge');
var queue = require('block-queue');
var dgram = require('dgram'),
    config = require('config'),
    Messages = require('../app/core/messages'),
   // RequestService = require('../app/services/request-service'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler'),
    udpServer = dgram.createSocket('udp4');
var Parser =require('./parser');
var eport = require('./eport');
var portProcessor = require('./port-processing');
var ports=[];
var clientHost, clientPort;

udpServer.on('error', function (err) {

    console.log(err);
    // TODO
    //server.close();// no need to close

});

var RxQueue = queue(1, function(task, done) {
    Parser.packetParser(task,function (err,result) {
        if(err)
        {
            console.log('Error Parsing Packet');
            done();
           // return responseToClient(null, err, clientHost, clientPort);

        }
         ports = eport;
        for(var i=0;i<ports.length;i++)
        {
            if(ports[i].FPGA==result.FPGA && ports[i].ePortNumber==result.ePortNumber)
            {
                ports[i].clientHost=result.clientHost;
                ports[i].clientPort=result.clientPort;
                //console.log('Matched to eport  :'+ports[i].ePortNumber+' FPGA :'+ports[i].FPGA);
                portProcessor.updatePort(ports[i],result.stepNo,result.data,function (err,result) {
                    if(err)
                    {
                        console.log('Error in Port Processing');
                        done();
                    }
                    TxQueue.push(result);
                });
                break;
            }
        }
        done();
    });
});

var TxQueue = queue(1,function (task,done) {
    console.log('Transmission Packet '+task.data);
    console.log('Client Host '+task.clientHost);
    console.log('Client Port '+task.clientPort);
    EventLoggersHandler.logger.info('From PBS-Bridge : '+JSON.stringify(task));
    udpServer.send(task.data, 0, task.data.length, task.clientPort, task.clientHost, function (err, bytes) {

        if (err) {
            throw err;
        }

        EventLoggersHandler.logger.info("Step " + task.data.slice(1, 2) + " " + Messages.SENDING_RESPONSE_DATA_PACKET + " " + task.data);
    });
    done();
});

udpServer.on('message', function (message, rinfo) {

    var UDPPacketInfo={
        message:"" + message,
        clientHost : rinfo.address,
        clientPort : rinfo.port
    };
/*
    message = "" + message; // to convert buffer data into string data type
    clientHost = rinfo.address;
    clientPort = rinfo.port;
*/

    RxQueue.push(UDPPacketInfo);

    //pro.processPort();
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
