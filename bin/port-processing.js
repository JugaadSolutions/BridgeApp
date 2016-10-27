/**
 * Created by root on 27/10/16.
 */

var User = require('../app/services/user-service');

var receivedEport={};
exports.updatePort = function (eport,stepNo,data) {

    receivedEport=eport;
    console.log('Update function called with this Eport '+JSON.stringify(receivedEport));
    console.log('Step Number   : '+stepNo);
    console.log('Received Data : '+data);

    switch (stepNo)
    {
        case 1:
                   /* User.checkOutAuthenticationService(data,function (err,result) {
                        
                    });*/
            break;
        case 3:
            break;
        case 6:
            break;
        case 7:
            break;
        case 9:
            break;
    }
};
