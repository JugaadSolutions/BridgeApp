/**
 * Created by root on 27/10/16.
 */

var User = require('../app/services/user-service');
    //EventLoggersHandler = require('../handlers/event-loggers-handler');

var receivedEport={};
/*
var str =[
    '/4051CB3497B400000000E00401006B5D0298950FFFFFFFFFFFF00001001131311016063064285731789111109876543211234567890098765432112FFFFFFFFFFFF00000000000000000000000000000000000000~',
'/4051CB3497B400000000E00401006B5D0298950FFFFFFFFFFFF000010011313110160630642857317891111pbspbspbspbspbspbspbspbspbspbspbFFFFFFFFFFFF00000000000000000000000000000000000000~',
'/4051CB3497B400000000E00401006B5D0298950FFFFFFFFFFFF000010011313110160630642857317891111dultdultdultdultdultdultdultdultFFFFFFFFFFFF00000000000000000000000000000000000000~',
'/4051CB3497B400000000E00401006B5D0298950FFFFFFFFFFFF000010011313110160630642857317891111pwcpwcpwcpwcpwcpwcpwcpwcpwcpwcpwFFFFFFFFFFFF00000000000000000000000000000000000000~'
];
var i=0;
*/

exports.updatePort = function (eport,stepNo,data,callback) {

    receivedEport=eport;
    //console.log('Update function called with this Eport '+JSON.stringify(receivedEport));
    //console.log('Step Number   : '+stepNo);
    //console.log('Received Data : '+data);

    switch (stepNo)
    {
        case 1:
                    eport.data = data;
                    User.checkOutAuthenticationService(eport,function (err,result) {
                       if(err)
                       {
                           return callback(err,null);
                       }
                        return callback(null,result);
                    });



            break;
        case 3:
                    eport.data = data;
                    User.checkOutCommunicationService(eport, function (err, result, balance) {
                        var updateServer = false;

                        if (err) {
                          /*  var stepNumber = 4;
                            var command = 1;
                            var indicatorId = 1;
                            var checkoutStatus = 2;
                            var checkInTime = moment().format('DDMMYYhhmm');

                            if (balance) {
                                result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 56, 61, balance);
                                result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 63, 72, checkInTime);

                                EventLoggersHandler.logger.info(Messages.BALANCE_UPDATED_SUCCESSFULLY + 'Amount: ' + balance);
                            }

                            result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 1, 2, stepNumber);
                            result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 37, 38, command);
                            result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 38, 39, indicatorId);
                            result.data = UtilsHandler.replaceStringWithIndexPosition(result.data, 62, 63, checkoutStatus);
*/
                            //message = message.replace(datapacket, dataFrame);
                            //return responseToClient(null, message, clientHost, clientPort, updateServer);
                            return callback(err,null);
                        }

                        //updateServer = true;
                       // message = message.replace(dataFrame, datapacket);
                        //responseToClient(null, message, clientHost, clientPort, updateServer);

                        //EventLoggersHandler.logger.info(Messages.CHECKOUT_SUCCESSFUL);
                       /* if(i>3)
                        {
                            i=0;
                        }
                        result.data=str[i];
                        i=i+1;*/
                        return callback(null,result);
                    });

            break;
        case 6:
            break;
        case 7:
            eport.data = data;
            User.checkInCommunicationService(eport,function (err,result) {
                if(err)
                {
                    return callback(err,null);

                }
                return callback(null,result);
            });
            break;
        case 9:
            break;
    }
};
