require('./parser');
require('../bin/pbs-bridge');
var queue = require('block-queue');
var dgram = require('dgram'),
    config = require('config'),
    Messages = require('../app/core/messages'),
   // RequestService = require('../app/services/request-service'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler'),
    LocalUpdaterService = require('../app/services/localupdate-service'),
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

var UpdateQueue = queue(1,function (task, done) {

    LocalUpdaterService.updateDB(task,function (err,result) {
        if(err)
        {
            console.log('Error Updating Record');
            done();
        }
        var time= 3000;
        var msg='Checkin Successful';
        if(result.checkOutTime)
        {
            time=4995;
            msg='Checkout Successful';
        }
        setTimeout(function () {
            var unit = result.fpga;
            var port = result.port;
            var data= '/A0'+unit+port+'100000000000~';
            var transactionPacket = {
                data:data,
                clientPort: result.clientPort,
                clientHost: result.clientHost
            };
            TxQueue.push(transactionPacket);
        },time);
        console.log('Updation Successful :'+msg);
        done();
    });

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
                        return;
                    }
                    if(result.data[1]!=7) {
                        var transactionPacket = {
                            data: result.data,
                            clientPort: result.clientPort,
                            clientHost: result.clientHost
                        };
                        TxQueue.push(transactionPacket);
                    }
                    else
                    {
                        //eport.data='/A051030000000000~';
                        var temp = result.data.slice(2,5);
                        var newdata='/A'+temp+'900000000000~';
                        var transactionPacket = {
                            data: newdata,
                            clientPort: result.clientPort,
                            clientHost: result.clientHost
                        };
                        TxQueue.push(transactionPacket);
                    }
                    if(result.data[1]==4 || result.data[1]==7)
                    {
                        var updateObj={};
                        if(result.data[1]==4)
                        {
                            var obj={
                                type:'checkout',
                                PortID:result.PortID,
                                FPGA:result.FPGA,
                                ePortNumber:result.ePortNumber,
                                UserID:result.UserID,
                                cardRFID:result.cardRFID,
                                vehicleid:result.vehicleid,
                                vehicleRFID:result.vehicleRFId,
                                vehicleUid:result.vehicleUid,
                                portStatus:result.portStatus,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };

                            updateObj=obj;

                        }
                        else
                        {
                            var obj={
                                type:'checkin',
                                PortID:result.PortID,
                                FPGA:result.FPGA,
                                ePortNumber:result.ePortNumber,
                                UserID:result.UserID,
                                cardRFID:result.cardRFID,
                                vehicleRFId:result.vehicleRFId,
                                vehicleUid:result.vehicleUid,
                                portStatus:result.portStatus,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };

                            updateObj=obj;
                        }
                        UpdateQueue.push(updateObj);
                       // done();
                    }

                });
                break;
            }
        }

    });
    done();
});

//var

var TxQueue = queue(1,function (task,done) {
   // console.log('Transmission Packet '+task.data);
    //console.log('Client Host '+task.clientHost);
    //console.log('Client Port '+task.clientPort);
    //EventLoggersHandler.logger.info('From PBS-Bridge : '+JSON.stringify(task));
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


/*function responseToClient(err, message, host, port, updateServer) {

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
}*/
/*
var units=['04','05'];
var unitClientHost=['192.168.1.4','192.168.1.5'];
var unitIndex=0;
setInterval(function () {
    //EventLoggersHandler.logger.info(Messages.CHECKOUT_VERIFICATION_INITIATED + datapacket.slice(2, 4));
    console.log('Checkin Timed out');
    //isCheckinVerification = true;
    var packetArray = [];

    var packet = '/5' + units[unitIndex] + '8100000000000~';

    packetArray.push(packet);
    console.log('Packet array '+packetArray);

    ReportService.checkBicycleAvailability(packetArray, unitClientHost[unitIndex]);
    unitIndex=unitIndex+1;
    if(unitIndex>1)
    {
        unitIndex=0;
    }

}, 5000);*/
//require('./serverbridge');