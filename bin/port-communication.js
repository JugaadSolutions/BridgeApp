require('./parser');
require('../bin/pbs-bridge');
var async = require('async');
var queue = require('block-queue');
var user = require('../app/models/users');
var Vehicle = require('../app/models/vehicle');
var CheckOut = require('../app/models/checkout');
var moment = require('moment');
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
var usersArray=[];
var blacklistArray=[];
var clientHost, clientPort;
var uA = require('./userArray');
var bA = require('./blacklistUser');
usersArray = uA;
blacklistArray = bA;
udpServer.on('error', function (err) {

    console.error(err);
    // TODO
    //server.close();// no need to close

});
/* *************************************** */


var PollPackets = [
    {"data":"/5030000000000000~","clientPort":"1024","clientHost":"13.13."+config.get('subnet')+".3"},
    {"data":"/5040000000000000~","clientPort":"1024","clientHost":"13.13."+config.get('subnet')+".4"},
    {"data":"/5050000000000000~","clientPort":"1024","clientHost":"13.13."+config.get('subnet')+".5"},
    {"data":"/5060000000000000~","clientPort":"1024","clientHost":"13.13."+config.get('subnet')+".6"}
];

var PollPacketIndex = 0;

setInterval(function () {

    if(PollPacketIndex >= 4 )
        PollPacketIndex = 0;

    TxQueue.push(PollPackets[PollPacketIndex++]);
},10000);

var UpdateQueue = queue(1,function (task, done) {

    if(task.type=='checkout')
    {
        LocalUpdaterService.updateDB(task,function (err,result) {
            if(err)
            {
                console.log('Error Updating Record');
                //done();
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
            //done();
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
                //done();
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
            //done();
        });

    }
    done();
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
        //Checking the array for already checked out user to avoid multiple checkout
        ports = eport;
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
                if(result)
                {
                    keyUser = userdetails.smartCardKey;
                    for(var i = 0; i < ports.length; i++) {
                        if (ports[i].FPGA == result.FPGA && ports[i].ePortNumber == result.ePortNumber) {
                            ports[i].clientHost = result.clientHost;
                            ports[i].clientPort = result.clientPort;
                            if(ports[i].portStatus!=Constants.AvailabilityStatus.TRANSITION)
                            {
                                ports[i].checkOutInitiatedTime= new Date();
                                portProcessor.updatePort(ports[i], result.stepNo, result.data,keyUser, function (err, result) {
                                    if (err) {

                                        if(err.name=='Trans')
                                        {
                                            var unit = err.unit;
                                            var port = err.port;
                                            var clientPort= err.clientPort;
                                            var clientHost= err.clientHost;

                                            var data = '/A0' + unit + port + 'B00000000000~';
                                            var transPacket = {
                                                data: data,
                                                clientPort: err.clientPort,
                                                clientHost: err.clientHost
                                            };
                                            TxQueue.push(transPacket);
                                            var time = 2000;
                                            console.log('Please Verify your card at KIOSK');
                                            setTimeout(function () {
                                                var unit = unit;
                                                var port = port;
                                                var data = '/A0' + unit + port + '100000000000~';
                                                var transactionPacket = {
                                                    data: data,
                                                    clientPort: clientPort,
                                                    clientHost: clientHost
                                                };
                                                TxQueue.push(transactionPacket);
                                            }, time,clientPort,clientHost,unit,port);
                                            done();
                                            return console.error(err.message.toString());

                                        }

                                        else
                                        {
                                            console.log('Error in Port Processing');
                                            done();
                                            return;
                                        }

                                    }
                                    var transactionPacket = {
                                        data: result.data,
                                        clientPort: result.clientPort,
                                        clientHost: result.clientHost
                                    };
                                    TxQueue.push(transactionPacket);
                                    done();
                                });
                            }

                        }
                    }
                }

            });
            done();
        }
        else if (result.stepNo == 6) {           //poll response
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
                            if(ports[i].portStatus!=Constants.AvailabilityStatus.TRANSITION) {
                                portProcessor.updatePort(ports[i], result.stepNo, cycle[j], keyUser, function (err, result) {
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

            }
            done();
        }
        else if (result.stepNo == 3) {
            var proceed = true;
            if(proceed)
            {
                for(var u=0;u<usersArray.length;u++) {
                    if (usersArray[u] == result.data.slice(5, 21)) {
                        proceed=false;
                        done();
                        break;
                    }
                }
            }
            /*if(proceed)
            {
                for(var b=0;b<blacklistArray.length;b++) {
                    if (blacklistArray[b] == result.data.slice(5, 21)) {
                        proceed=false;
                        done();
                        break;
                    }
                }
            }*/
            if(proceed)
            {
                for (var i = 0; i < ports.length; i++) {
                    if (ports[i].FPGA == result.FPGA && ports[i].ePortNumber == result.ePortNumber) {
                        ports[i].clientHost = result.clientHost;
                        ports[i].clientPort = result.clientPort;
                        portProcessor.updatePort(ports[i], result.stepNo, result.data, keyUser, function (err, result) {
                            if (err) {

                                if (err.name == 'Trans') {
                                    var unit = err.unit;
                                    var port = err.port;
                                    var clientPort = err.clientPort;
                                    var clientHost = err.clientHost;

                                    var data = '/A0' + unit + port + 'B00000000000~';
                                    var transPacket = {
                                        data: data,
                                        clientPort: err.clientPort,
                                        clientHost: err.clientHost
                                    };
                                    TxQueue.push(transPacket);
                                    var time = 2000;
                                    console.log('Please Verify your card at KIOSK');
                                    setTimeout(function () {
                                        var unit = unit;
                                        var port = port;
                                        var data = '/A0' + unit + port + '100000000000~';
                                        var transactionPacket = {
                                            data: data,
                                            clientPort: clientPort,
                                            clientHost: clientHost
                                        };
                                        TxQueue.push(transactionPacket);
                                    }, time, clientPort, clientHost, unit, port);
                                    done();
                                    return console.error(err.message.toString());

                                }
                                else if (err.name == 'PortError') {
                                    var unit = err.unit;
                                    var port = err.port;

                                    var data = '/A0' + unit + port + 'A00000000000~';
                                    var transPacket = {
                                        data: data,
                                        clientPort: err.clientPort,
                                        clientHost: err.clientHost
                                    };
                                    TxQueue.push(transPacket);
                                    done();
                                    return console.error(err.message.toString());
                                }
                                else {
                                    console.log('Error in Port Processing');
                                    done();
                                    return;
                                }

                            }
                            result.checkOutCompletionTime = new Date();
                            var transactionPacket = {
                                data: result.data,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost
                            };
                            usersArray.push(result.data.slice(5, 21));
                            TxQueue.push(transactionPacket);
                            setTimeout(function () {
                                var f = result.FPGA;
                                var p = result.ePortNumber;
                                for (var i = 0; i < ports.length; i++) {
                                    if (ports[i].FPGA == f && ports[i].ePortNumber == p) {
                                        if (ports[i].portStatus == Constants.AvailabilityStatus.TRANSITION) {
                                            ports[i].portStatus = Constants.AvailabilityStatus.EMPTY;
                                            break;
                                        }
                                    }
                                }
                            }, 10000);
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
                                portStatus: Constants.AvailabilityStatus.EMPTY,
                                clientPort: result.clientPort,
                                clientHost: result.clientHost,
                                checkOutInitiatedTime: result.checkOutInitiatedTime,
                                checkOutCompletionTime: result.checkOutCompletionTime

                            };
                            UpdateQueue.push(obj);
                            Vehicle.findOne({vehicleUid: result.vehicleUid}, function (err, vehicleDetails) {
                                if (err) {
                                    console.error('Error finding cycle in port-comm : ' + err);
                                }
                                if (vehicleDetails) {
                                    user.findOne({smartCardNumber: result.cardRFID}, function (err, result) {
                                        if (err) {
                                            console.error('Error finding User in port-comm : ' + err);
                                        }
                                        var vehicleInfo = {
                                            vehicleid: vehicleDetails._id,
                                            vehicleUid: vehicleDetails.vehicleUid
                                        };
                                        result.vehicleId.push(vehicleInfo);
                                        user.findByIdAndUpdate(result._id, result, function (err, userUpdated) {
                                            if (err) {
                                                console.error('Error updating User in port-comm : ' + err);
                                            }
                                            if (userUpdated._type == 'member') {
                                                for (var j = 0; j < usersArray.length; j++) {
                                                    if (userUpdated.smartCardNumber == usersArray[j]) {
                                                        usersArray.splice(j, 1);
                                                    }
                                                    if (j == usersArray.length - 1) {
                                                        done();
                                                        break;
                                                    }
                                                }
                                            }
                                            else if (userUpdated._type != 'redistribution-employee' || userUpdated._type != 'maintenancecentre-employee' || userUpdated._type != 'member') {
                                                for (var k = 0; k < usersArray.length; k++) {
                                                    if (userUpdated.smartCardNumber == usersArray[k]) {
                                                        usersArray.splice(k, 1);
                                                    }
                                                    if (k == usersArray.length - 1) {
                                                        done();
                                                        break;
                                                    }
                                                }
                                            }

                                            console.log('User Updated in port-comm');
                                            // userUpdatedDetails = result;
                                        });
                                    });

                                }
                            });
                        });
                    }
                }
            }
            else
            {
                var unit = result.FPGA;
                var port = result.ePortNumber;
                var clientPort = result.clientPort;
                var clientHost = result.clientHost;

                var data = '/A0' + unit + port + 'B00000000000~';
                var transPacket = {
                    data: data,
                    clientPort: result.clientPort,
                    clientHost: result.clientHost
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
                        clientHost:  result.clientHost
                    };
                    TxQueue.push(transactionPacket);
                }, time);
                done();
            }

        }
        else if (result.stepNo == 7) {
            for(var i = 0; i < ports.length; i++) {
                if (ports[i].FPGA == result.FPGA && ports[i].ePortNumber == result.ePortNumber) {
                    ports[i].clientHost = result.clientHost;
                    ports[i].clientPort = result.clientPort;
                    if(ports[i].portStatus!=Constants.AvailabilityStatus.TRANSITION)
                    {
                        portProcessor.updatePort(ports[i], result.stepNo, result.data,keyUser, function (err, result) {
                            if (err) {

                                /*if(err.name=='Trans')
                                {
                                    var unit = err.unit;
                                    var port = err.port;
                                    var clientPort= err.clientPort;
                                    var clientHost= err.clientHost;

                                    var data = '/A0' + unit + port + 'B00000000000~';
                                    var transPacket = {
                                        data: data,
                                        clientPort: err.clientPort,
                                        clientHost: err.clientHost
                                    };
                                    TxQueue.push(transPacket);
                                    var time = 2000;
                                    console.log('Please Verify your card at KIOSK');
                                    setTimeout(function () {
                                        var unit = unit;
                                        var port = port;
                                        var data = '/A0' + unit + port + '100000000000~';
                                        var transactionPacket = {
                                            data: data,
                                            clientPort: clientPort,
                                            clientHost: clientHost
                                        };
                                        TxQueue.push(transactionPacket);
                                    }, time,clientPort,clientHost,unit,port);
                                    done();
                                    return console.error(err.message.toString());

                                }

                                else
                                {*/
                                    console.log('Error in Checkin Processing : '+err);
                                    done();
                                  //  break;
                                    //return;
                               // }

                            }
                            if(result)
                            {

                                /*CheckOut.findOne({vehicleId:result.vehicleUid,fromPort:result.PortID,checkOutTime:{$lt:moment()}}).sort({checkOutTime:-1}).lean().exec(function (err,coutDetails) {
                                    if(err)
                                    {
                                        console.error('Error while finding checkout : '+err);
                                    }
                                    if(coutDetails)
                                    {
                                        var durationMin = moment.duration(moment().diff(coutDetails.checkOutTime));
                                        var duration = durationMin.asMinutes();
                                        if(duration<1)
                                        {
                                            user.findOne({UserID:coutDetails.user}).exec(function (err,result) {
                                                if(err)
                                                {
                                                    console.error('Error while finding user : '+err);
                                                }
                                                if(!result)
                                                {
                                                    console.error('No user found for this id ');
                                                }
                                                else
                                                {
                                                    blacklistArray.push(result.smartCardNumber);
                                                    blacklist(result.smartCardNumber);
                                                }
                                            });
                                        }

                                    }*/
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

                                /*});*/

                            }
                            else
                            {
                                done();
                            }

                        });
                    }
                    else
                    {
                        done();

                    }

                }
                else
                {
                    done();
                }
            }
        }
        else if (result.stepNo == 9){
            for(var i = 0; i < ports.length; i++) {
                if (ports[i].FPGA == result.FPGA && ports[i].ePortNumber == result.ePortNumber) {
                    ports[i].clientHost = result.clientHost;
                    ports[i].clientPort = result.clientPort;
                    portProcessor.updatePort(ports[i], result.stepNo, result.data,keyUser, function (err, result) {
                        if (err) {

                            if(err.name=='Trans')
                            {
                                var unit = err.unit;
                                var port = err.port;
                                var clientPort= err.clientPort;
                                var clientHost= err.clientHost;

                                var data = '/A0' + unit + port + 'B00000000000~';
                                var transPacket = {
                                    data: data,
                                    clientPort: err.clientPort,
                                    clientHost: err.clientHost
                                };
                                TxQueue.push(transPacket);
                                var time = 2000;
                                console.log('Please Verify your card at KIOSK');
                                setTimeout(function () {
                                    var unit = unit;
                                    var port = port;
                                    var data = '/A0' + unit + port + '100000000000~';
                                    var transactionPacket = {
                                        data: data,
                                        clientPort: clientPort,
                                        clientHost: clientHost
                                    };
                                    TxQueue.push(transactionPacket);
                                }, time,clientPort,clientHost,unit,port);
                                done();
                                return console.error(err.message.toString());

                            }

                            else
                            {
                                console.log('Error in Port Processing');
                                done();
                                return;
                            }

                        }
                        var transactionPacket = {
                            data: result.data,
                            clientPort: result.clientPort,
                            clientHost: result.clientHost
                        };
                        TxQueue.push(transactionPacket);
                        done();
                    });
                }
            }
        }
        else {
            done();
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
    var u = new Date();
    var t = u.getHours();

    if(t<config.get('time.from') ||t>config.get('time.to'))
    {

        var Packet = UDPPacketInfo.message.toUpperCase();
        Packet = Packet.slice(1, 2);
        if(Packet=="7" || Packet=="6")
        {
            RxQueue.push(UDPPacketInfo);
        }
        else
        {
            console.log('Non operational Hours');
        }
    }
    else
    {*/
        RxQueue.push(UDPPacketInfo);
   // }

});


udpServer.on('listening', function () {
    console.log("UDP Server listening to requests from Anywhere");
});

udpServer.bind({
    address: config.get("udp.host"),
    port: config.get("udp.port"),
    exclusive: true
});

/*
function blacklist(rfid) {
    var RFID = rfid;
    setTimeout(function () {
        for(var i=0;i<blacklistArray.length;i++)
        {
            if(blacklistArray[i]==RFID)
            {
                blacklistArray.splice(i,1);
            }
        }
    },60000*Number(config.get('blacklistDelay')));
}*/
