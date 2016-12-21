require('./parser');
require('../bin/pbs-bridge');
var queue = require('block-queue');
var dgram = require('dgram'),
    config = require('config'),
    Messages = require('../app/core/messages'),
    Constants = require('../app/core/constants'),
   // RequestService = require('../app/services/request-service'),
    EventLoggersHandler = require('../app/handlers/event-loggers-handler'),
    LocalUpdaterService = require('../app/services/localupdate-service'),
    UserService = require('../app/services/user-service'),
    udpServer = dgram.createSocket('udp4');
var Parser =require('./parser');
var eport = require('./eport');
var portProcessor = require('./port-processing');
var ports=[];
var clientHost, clientPort;

udpServer.on('error', function (err) {

    console.error(err);
    // TODO
    //server.close();// no need to close

});
/* *************************************** */


var PollPackets = [
    {"data":"/5030000000000000~","clientPort":"1024","clientHost":"13.13.12.3"},
    {"data":"/5040000000000000~","clientPort":"1024","clientHost":"13.13.12.4"},
    {"data":"/5050000000000000~","clientPort":"1024","clientHost":"13.13.12.5"},
    {"data":"/5060000000000000~","clientPort":"1024","clientHost":"13.13.12.6"}
];

var PollPacketIndex = 0;

setInterval(function () {

    if(PollPacketIndex >= 4 )
        PollPacketIndex = 0;

    TxQueue.push(PollPackets[PollPacketIndex++]);
},30000);

var UpdateQueue = queue(1,function (task, done) {

    if(task.type=='checkout')
    {
        LocalUpdaterService.updateDB(task,function (err,result) {
            if(err)
            {
                console.log('Error Updating Record');
                done();
            }

                var time=4995;
                var msg='Checkout Successful';

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

    }
    if(task.type=='checkin')
    {
        /*
        var time=0;
       // var msg='Checkin Successful';

        setTimeout(function () {
            var unit = task.FPGA;
            var port = task.ePortNumber;
            var data= '/A0'+unit+port+'200000000000~';
            var transactionPacket = {
                data:data,
                clientPort: task.clientPort,
                clientHost: task.clientHost
            };
            TxQueue.push(transactionPacket);
        },time);*/

        LocalUpdaterService.updateDBcheckin(task,function (err,result) {
            if(err)
            {
                console.log('Error Updating Record');
                done();
            }
            var unit = task.FPGA;
            var port = task.ePortNumber;
            var data= '/A0'+unit+port+'900000000000~';
            var transactionPacket = {
                data: data,
                clientPort: task.clientPort,
                clientHost: task.clientHost
            };
            TxQueue.push(transactionPacket);

            var time=2000;
            var msg='Checkin Successful';

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
            setTimeout(function () {
                var unit = result.fpga;
                var data= '/50'+unit+'0000000000000~';
                var transactionPacket = {
                    data:data,
                    clientPort: result.clientPort,
                    clientHost: result.clientHost
                };
                TxQueue.push(transactionPacket);
            },time);
            done();
        });

    }

});

var RxQueue = queue(1, function(task, done) {
    var keyUser;
    Parser.packetParser(task,function (err,result) {
        if (err) {
            console.log('Error Parsing Packet');
            return console.error(err.message.toString());
            done();
            // return responseToClient(null, err, clientHost, clientPort);
        }

        if (result.stepNo == 1) {
            UserService.userVerify(result.data.slice(5, 21),function (err,eid,userdetails) {
                if(err)
                {
                    if(eid==1) {
                        var unit = result.FPGA;
                        var port = result.ePortNumber;
                        var data = '/A0' + unit + port + 'B00000000000~';
                        var transPacket = {
                            data: data,
                            clientPort: task.clientPort,
                            clientHost: task.clientHost
                        };
                        TxQueue.push(transPacket);
                        var time = 2000;
                        console.log('Please Verify your card at KIOSK');
                        setTimeout(function () {
                            var unit = result.FPGA;
                            var port = result.ePortNumber;
                            var data = '/A0' + unit + port + '100000000000~';
                            var transactionPacket = {
                                data: data,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };
                            TxQueue.push(transactionPacket);
                        }, time);
                        return console.error(err.message.toString());
                        done();
                    }else {
                        console.log('Error Parsing Packet');
                        return console.error(err.message.toString());
                        done();
                    }
                }
                keyUser = userdetails.smartCardKey;
            });
        }

            ports = eport;
        if (result.stepNo == 6) {           //poll response
            var portNumber = [];
            var cycle = [];

            portNumber.push(result.data.slice(4, 5));
            cycle.push(result.data.slice(5, 21));

            portNumber.push(result.data.slice(21, 22));
            cycle.push(result.data.slice(22, 38));

            portNumber.push(result.data.slice(38, 39));
            cycle.push(result.data.slice(39, 55));

            portNumber.push(result.data.slice(55, 56));
            cycle.push(result.data.slice(56, 72));

            for (var i = 0; i < ports.length; i++) {
                if (ports[i].FPGA == result.FPGA ) {

                    for (var j = 0; j < 4; j++) {

                        if (ports[i].ePortNumber == portNumber[j]) {
                            ports[i].clientHost = result.clientHost;
                            ports[i].clientPort = result.clientPort;
                            portProcessor.updatePort(ports[i], result.stepNo, cycle[j],keyUser, function (err, result) {
                                if (err) {
                                    console.log('Error in Port Processing');
                                    done();
                                    return;
                                }
                                var transactionPacket = {
                                    data: result.data,
                                    clientPort: result.clientPort,
                                    clientHost: result.clientHost
                                };
                                TxQueue.push(transactionPacket);
                            });
                        }
                    }

                }

            }
           // done();
        }
        else {      //steps: 1,3,7
        for (var i = 0; i < ports.length; i++) {
            if (ports[i].FPGA == result.FPGA && ports[i].ePortNumber == result.ePortNumber) {
                ports[i].clientHost = result.clientHost;
                ports[i].clientPort = result.clientPort;

                if (result.stepNo == 7) {
                    var unit = result.FPGA;
                    var port = result.ePortNumber;
                    var data = '/A0' + unit + port + '200000000000~';
                    var transPacket = {
                        data: data,
                        clientPort: task.clientPort,
                        clientHost: task.clientHost
                    };
                    TxQueue.push(transPacket);
                }
                //console.log('Matched to eport  :'+ports[i].ePortNumber+' FPGA :'+ports[i].FPGA);
                portProcessor.updatePort(ports[i], result.stepNo, result.data,keyUser, function (err, result) {

                    if (err) {
                        console.log('Error in Port Processing');
                        done();
                        return;
                    }


                    if ((result.data[1] != 7) && (result.data[1] != 6)) {
                        if(result.data[1] == 4){
                            var transactionPacket = {
                                data: result.data,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };
                            TxQueue.push(transactionPacket);
                            setTimeout(function () {
                                var f= result.FPGA;
                                var p= result.ePortNumber;
                                for (var i = 0; i < ports.length; i++) {
                                    if (ports[i].FPGA == f && ports[i].ePortNumber == p) {
                                        ports[i].portStatus=Constants.AvailabilityStatus.EMPTY;
                                        break;
                                    }
                                }
                            },10000);
                        }
                        else if(result.data[0]!='/')
                        {

                        }
                        else
                        {
                            var transactionPacket = {
                                data: result.data,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };
                            TxQueue.push(transactionPacket);
                        }

                    }

                    //eport.data='/A051030000000000~';


                    if (result.data[1] == 4 || result.data[1] == 7) {
                        var updateObj = {};
                        if (result.data[1] == 4) {
                            var obj = {
                                type: 'checkout',
                                PortID: result.PortID,
                                FPGA: result.FPGA,
                                ePortNumber: result.ePortNumber,
                                UserID: result.UserID,
                                cardRFID: result.cardRFID,
                                vehicleid: result.vehicleid,
                                vehicleRFID: result.vehicleRFId,
                                vehicleUid: result.vehicleUid,
                                portStatus: result.portStatus,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };

                            //updateObj = obj;
                            UpdateQueue.push(obj);
                            done();

                        }
                        else {
                            var obj = {
                                type: 'checkin',
                                PortID: result.PortID,
                                FPGA: result.FPGA,
                                ePortNumber: result.ePortNumber,
                                UserID: result.UserID,
                                cardRFID: result.cardRFID,
                                vehicleRFId: result.vehicleRFId,
                                vehicleUid: result.vehicleUid,
                                portStatus: result.portStatus,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };

                            UpdateQueue.push(obj);
                            done();
                        }
                        //UpdateQueue.push(updateObj);
                        // done();
                    }

                });
                break;
            }
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
    if(task.data[1]=="A" && task.data[5]=="0")
    {
        setTimeout(function () {
            var temp = task.data.slice(2,5);
            var newdata='/A'+temp+'100000000000~';
            var transactionPacket = {
                data: newdata,
                clientPort: task.clientPort,
                clientHost: task.clientHost
            };
            TxQueue.push(transactionPacket);
        },1000)
    }
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
    console.log("UDP Server listening to requests from Anywhere");
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