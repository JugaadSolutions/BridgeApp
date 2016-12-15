/**
 * Created by root on 16/10/16.
 */

var async = require('async'),
    moment = require('moment');

var Messages = require('../core/messages'),
    _ = require('underscore'),
    jwt = require('jsonwebtoken'),
    config = require('config'),
    Constants = require('../core/constants'),
    moment = require('moment'),
    Vehicle=require('../models/vehicle'),
    EventLoggersHandler = require('../handlers/event-loggers-handler'),
    User = require('../models/user');
var DockingStation = require('../models/dock-station'),
    UtilsHandler = require('../handlers/utils-handler'),
    DockingPort = require('../models/dock-port');


/* ************** For Bridge ************************** */

exports.userVerify = function (id,callback) {
    User.findOne({'smartCardNumber':id}).lean().exec(function (err,result) {
        if(err)
        {
            return console.error('User not Found : '+err);
        }
        if (!result) {
            EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
            return callback(new Error("Sorry! Member with that Smart Card RFID does not exist."),1, null);
        }
        if(result._type=='member')
        {
            if (!result.status == Constants.MemberStatus.REGISTERED) {
                EventLoggersHandler.logger.warn(Messages.IT_LOOKS_LIKE_YOUR_VALIDITY_HAS_EXPIRED_OR_YOU_DONT_HAVE_SUFFICIENT_BALANCE);
                return callback(new Error("Sorry! It looks like your validity has expired"),1,null);
            }

            if (result.creditBalance <= 5) {
                EventLoggersHandler.logger.warn(Messages.YOU_DONT_HAVE_SUFFICIENT_BALANCE);

                return callback(new Error("Sorry! You don't have sufficient balance"),1,null);
            }
            var validity = moment(result.validity);
            var current = moment();
            var days = moment.duration(validity.diff(current));
            var duration = days.asDays();
            if(duration<0)
            {
                EventLoggersHandler.logger.warn(Messages.IT_LOOKS_LIKE_YOUR_VALIDITY_HAS_EXPIRED_OR_YOU_DONT_HAVE_SUFFICIENT_BALANCE);
                return callback(new Error("Sorry! It looks like your validity has expired"),1,null);
            }

            //console.log(userDetails.smartCardKey);
            //keyUser = userDetails.smartCardKey;
            //console.log(keyUser);
            //callback(null,null);
        }

        return callback(null,0,result);
    });
};

exports.checkOutAuthenticationService=function (record,keyUser,cb) {
    var command;
       // keyUser;
    var Ds=0;
    var Dp=0;
    var userDetails=0;
async.series([
    /*function (callback) {
        command = record.data[21];
        if (command != "1") {
            EventLoggersHandler.logger.warn(Messages.SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT);
            return callback(new Error("Sorry! It looks like you tapped on an open port", null));
        }
        var userIds = record.data.slice(5, 21);
        User.findOne({'smartCardNumber':userIds}).lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            if (!result) {
                EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                return callback(new Error("Sorry! Member with that Smart Card RFID does not exist."), null);
            }
            userDetails=result;
            return callback(null,result);
        });
    },*/
    function (callback) {
    //console.log(record.data.length);
        command = record.data[21];
        if (command != "1") {
            EventLoggersHandler.logger.warn(Messages.SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT);
            return callback(new Error("Sorry! It looks like you tapped on an open port", null));
        }

        if (record.data.length != 43) {
            EventLoggersHandler.logger.error(Messages.THIS_IS_AN_INVALID_DATA_PACKET_FOR_USER_AUTHENTICATION_EXPECTING_42_BYTES);
            return callback(new Error("This is an invalid Data Packet for User Authentication. Expecting 42 bytes.", null));
        }

        DockingStation.findOne({'ipAddress': config.get('ipAddress')},function (err,result) {
            if(err)
            {
                EventLoggersHandler.logger.error(err);
                return callback(err, null);
            }
            if (!result) {
                EventLoggersHandler.logger.error(Messages.NO_DOCKING_STATION_FOUND_WITH_THE_IP_ADDRESS + config.get('ipAddress'));
                return callback(new Error(Messages.NO_DOCKING_STATION_FOUND_WITH_THE_IP_ADDRESS), null);
            }
            if (result.operationStatus != Constants.OperationStatus.OPERATIONAL) {
                EventLoggersHandler.logger.error(Messages.DOCKING_STATION_IS_UNDER_MAINTENANCE, result.name);
                return callback(new Error(Messages.DOCKING_STATION_IS_UNDER_MAINTENANCE), null);
            }
            Ds=result;
            return callback(null,null);
        });

    },
    function (callback) {
        if(Ds!=0) {
            var FPGA = record.data.slice(2, 4);
            var eportNumber = record.data.slice(4, 5);

            DockingPort.findOne({'FPGA': FPGA, 'ePortNumber': eportNumber}, function (err, result) {
                if (err) {
                    EventLoggersHandler.logger.error(err);
                    return callback(err, null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + FPGA);
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER + eportNumber);
                    return callback(new Error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + " and " + Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER), null);
                }
                if (record.portStatus != Constants.AvailabilityStatus.FULL) {
                    EventLoggersHandler.logger.error(Messages.DOCKING_PORT_IS_UNDER_MAINTENANCE+' OR EMPTY', eportNumber);
                    return callback(new Error(Messages.DOCKING_PORT_IS_UNDER_MAINTENANCE+' OR EMPTY'), null);
                }
                Dp=result;
                return callback(null,result);
            });
        }
        else
        {
            return callback(null,null);
        }
    },/*
    function (callback) {
        if(Dp!=0)
        {
            command = record.data[21];
            if (command != "1") {
                EventLoggersHandler.logger.warn(Messages.SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT);
                return callback(new Error("Sorry! It looks like you tapped on an open port", null));
            }
            var userIds = record.data.slice(5, 21);
            User.findOne({'smartCardNumber':userIds}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                    return callback(new Error("Sorry! Member with that Smart Card RFID does not exist."), null);
                }
               userDetails=result;
                return callback(null,result);
            });
        }
        else
        {
            return callback(null,null);
        }
    }*//*,
    function (callback) {
        if(userDetails!=0)
        {
            if(userDetails._type=='member')
            {
                if (!userDetails.status == Constants.MemberStatus.REGISTERED) {
                    EventLoggersHandler.logger.warn(Messages.IT_LOOKS_LIKE_YOUR_VALIDITY_HAS_EXPIRED_OR_YOU_DONT_HAVE_SUFFICIENT_BALANCE);
                    return callback(new Error("Sorry! It looks like your validity has expired or you don't have sufficient balance"));
                }

                if (userDetails.creditBalance < 5) {
                    EventLoggersHandler.logger.warn(Messages.YOU_DONT_HAVE_SUFFICIENT_BALANCE);

                    return callback(new Error("Sorry! You don't have sufficient balance"));
                }
                //console.log(userDetails.smartCardKey);
                keyUser = userDetails.smartCardKey;
                //console.log(keyUser);
                callback(null,null);
            }
            else
            {
                keyUser = userDetails.smartCardKey;
                callback(null,null);
            }

        }
        else
        {
            return callback(null,null);
        }

    },*/
    function (callback) {
        var stepNumber = 2;
        var indicatorId = "2";
        var command = "9";
        keyUser="FFFFFFFFFFFF0000                                                                                                            ";
        record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 1, 2, stepNumber);
        record.data= UtilsHandler.replaceStringWithIndexPosition(record.data, 24, 40, keyUser);
        record.data= UtilsHandler.replaceStringWithIndexPosition(record.data, 22, 23, indicatorId);
        record.data= UtilsHandler.replaceStringWithIndexPosition(record.data, 21, 22, command);

        return callback(null, null);
    }

],function (err,result) {
    if(err)
    {
        return cb(err,null);
    }
    return cb(null,record);
});

};

exports.checkOutCommunicationService=function (record,cb) {

    var bicycleCheckOutStatus,
        keyCycle, command;

    var balance;
    var userId;
    var userDetails;
    async.series([
        function (callback) {
            if (record.data.length != 171) {
                EventLoggersHandler.logger.error(Messages.THIS_IS_AN_INVALID_DATA_PACKET_FOR_CHECKOUT_TRANSACTION_EXPECTING_171_BYTES);
                return callback(new Error("Sorry! This is an invalid Data Packet for Checkout Transaction. Expecting 171 bytes.", null));
            }
            command = record.data[37];
            if (command != "1") {
                EventLoggersHandler.logger.warn(Messages.SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT);
                return callback(new Error("Sorry! It looks like you tapped on an open port", null));
            }
            /*var fpga = record.data.slice(2, 4);
            var ePortNumber = record.data[4];
            DockingPort.findOne({'FPGA':fpga,'ePortNumber':ePortNumber}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + record.FPGA);
                    EventLoggersHandler.logger.error(Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER +record.ePortNumber);
                    return callback(new Error(Messages.NO_DOCKING_UNIT_FOUND_WITH_THE_UNIT_NUMBER + " and " + Messages.NO_DOCKING_PORT_FOUND_WITH_THE_PORT_NUMBER), null);
                }
                if(result.portStatus==Constants.AvailabilityStatus.EMPTY && result.vehicleId.length==0)
                {
                    EventLoggersHandler.logger.error(Messages.DOCKING_PORT_IS_EMPTY);
                }
            });*/
            if(record.portStatus==Constants.AvailabilityStatus.EMPTY)
            {
                EventLoggersHandler.logger.error(Messages.DOCKING_PORT_IS_EMPTY);
                return callback(new Error(Messages.DOCKING_PORT_IS_EMPTY), null);
            }
            return callback(null,null);
        },
            function (callback) {
                if (record.data.length != 171) {
                    EventLoggersHandler.logger.error(Messages.THIS_IS_AN_INVALID_DATA_PACKET_FOR_CHECKOUT_TRANSACTION_EXPECTING_171_BYTES);
                    return callback(new Error("Sorry! This is an invalid Data Packet for Checkout Transaction. Expecting 171 bytes.", null));
                }
                command = record.data[37];
                if (command != "1") {
                    EventLoggersHandler.logger.warn(Messages.SORRY_IT_LOOKS_LIKE_YOU_TAPPED_ON_AN_OPEN_PORT);
                    return callback(new Error("Sorry! It looks like you tapped on an open port", null));
                }
                var bicycleId = record.data.slice(21, 37);
                Vehicle.findOne({'vehicleRFID':bicycleId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if (!result) {
                        EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                        return callback(new Error("Sorry! Bicycle with that RFID does not exist or is not available. Contact admin immediately."), null);
                    }
                    /*if(result.vehicleCurrentStatus!=Constants.VehicleLocationStatus.WITH_PORT)
                    {
                        EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                        return callback(new Error("Sorry! Bicycle with that RFID does not exist or is not available. Contact admin immediately."), null);
                    }*/
                    record.vehicleRFID = result.vehicleRFID;
                    record.vehicleUid = result.vehicleUid;
                    record.vehicleid=result._id;
                    return callback(null, result);
                });
            }
        ,
        function (callback) {
            userId = record.data.slice(5, 21);
            User.findOne({'smartCardNumber':userId}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if (!result) {
                    EventLoggersHandler.logger.error(Messages.MEMBER_WITH_THAT_SMART_CARD_RFID_DOES_NOT_EXIST);
                    return callback(new Error("Sorry! Member with that Smart Card RFID does not exist."), null);
                }
                if(result._type=='member')
                {
                   /* var memberBalance = result.creditBalance;
                    var octalString = exports.generateControlNumber(memberBalance, 4);*/
                    balance = zeroPad(result.creditBalance,4);
                    //console.log('Balance : '+balance);
                    if (!result.status == Constants.MemberStatus.REGISTERED) {
                        EventLoggersHandler.logger.warn(Messages.IT_LOOKS_LIKE_YOUR_VALIDITY_HAS_EXPIRED_OR_YOU_DONT_HAVE_SUFFICIENT_BALANCE);
                        return callback(new Error("Sorry! It looks like your validity has expired or you don't have sufficient balance"));
                    }

                    /*if(result.vehicleId.length>0)
                    {
                        EventLoggersHandler.logger.warn(Messages.YOUR_PREVIOUS_TRANSACTION_IS_NOT_COMPLETE);
                        return callback(new Error("Sorry! It looks like your previous transaction is not completed"));
                    }*/

                    if (Number(result.creditBalance) <= 5) {
                        EventLoggersHandler.logger.warn(Messages.YOU_DONT_HAVE_SUFFICIENT_BALANCE);
                        return callback(new Error("Sorry! You don't have sufficient balance"));
                    }
                    //console.log(userDetails.smartCardKey);
                    //keyUser = userDetails.smartCardKey;
                    //console.log(keyUser);
                    userDetails = result;
                    record.UserID=result.UserID;
                    record.cardRFID=result.smartCardNumber;
                }
                return callback(null, result);
            });

        },
        function (callback) {
            var stepNumber = 4;

            bicycleCheckOutStatus = 1;
            command = 9;
            var userReadData = record.data.slice(56, 88);
            var indicatorId = 5;
            var transactionStatus = 1;
            var checkOutTime = moment().format('DDMMYYhhmm');
            keyCycle = 'FFFFFFFFFFFF0000';

            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 1, 2, stepNumber);
            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 37, 38, command);
            userReadData = UtilsHandler.replaceStringWithIndexPosition(userReadData, 0, 5, balance);
            userReadData = UtilsHandler.replaceStringWithIndexPosition(userReadData, 6, 7, bicycleCheckOutStatus);
            userReadData = UtilsHandler.replaceStringWithIndexPosition(userReadData, 7, 16, checkOutTime);
            userReadData = UtilsHandler.replaceStringWithIndexPosition(userReadData, 28, 29, transactionStatus);
            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 88, 120, userReadData);
            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 120, 136, keyCycle);
            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 38, 39, indicatorId);

            record.data = UtilsHandler.replaceStringWithIndexPosition(record.data, 56, 88, userReadData);

            record.portStatus= Constants.AvailabilityStatus.EMPTY;
            return callback(null, null);
        }
    ],function (err,results) {
        if(err)
        {
            return cb(err,null,record,balance);
        }
        return cb(null,record,null);
    });

};

exports.checkInCommunicationService = function (eport, cb) {

    var vehicleDetails;
    async.series([

            // Step 1 Validation
            function (callback) {

                if (eport.data.length != 26) {
                    EventLoggersHandler.logger.error(Messages.THIS_IS_AN_INVALID_DATA_PACKET_FOR_CHECKIN_TRANSACTION_EXPECTING_26_BYTES);
                    return callback(new Error("Sorry! This is an invalid Data Packet for CheckIn Transaction. Expecting 26 bytes.", null));
                }

                var bicycleId = eport.data.slice(5, 21);
                //console.log('Packet data(bicycleId) - '+bicycleId);

                Vehicle.findOne({'vehicleRFID': bicycleId/*, vehicleCurrentStatus: Constants.VehicleLocationStatus.WITH_MEMBER*/, 'vehicleStatus':Constants.OperationStatus.OPERATIONAL}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        EventLoggersHandler.logger.error(Messages.BICYCLE_WITH_THAT_RFID_DOES_NOT_EXIST_OR_IS_NOT_AVAILABLE_CONTACT_ADMIN_IMMEDIATELY);
                        return callback(new Error("Sorry! Bicycle with that RFID does not exist."), null);
                    }
                    eport.vehicleRFID = result.vehicleRFID;
                    eport.vehicleUid = result.vehicleUid;
                    eport.vehicleid=result._id;
                    eport.portStatus= Constants.AvailabilityStatus.FULL;
                    vehicleDetails = result;
                    return callback(null, result);

                });

            }/*,
        function (callback) {
            //var indicatorId = 3;
            User.findOne({'_id':vehicleDetails.currentAssociationId}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                eport.UserID=result.UserID;
                eport.cardRFID=result.smartCardNumber;
                return callback(null,result);
            });
        }*/
/*          ,

            // Step 2 update the packet
            function (callback) {

               /!* var stepNumber = 8;
                var indicatorId = "3";
                var command = "8";
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 1, 2, stepNumber);
                eport.data= UtilsHandler.replaceStringWithIndexPosition(eport.data, 23, 24, indicatorId);
                eport.data= UtilsHandler.replaceStringWithIndexPosition(eport.data, 21, 22, command);
*!/
                //eport.data='/A051000000000000~';
                var stepNumber = 'A';
                var indicatorId = 3;
                var command = "0";
                var data = "00000000";
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 5, 21, data);
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 1, 2, stepNumber);
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 5, 6, command);
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 6, 7, indicatorId);

                return callback(null, null);

            }*/

        ],
        function (err, results) {

            if (err) {
                return cb(err, eport)
            }

            return cb(null, eport);

        });

};

exports.errorHandler = function (eport,cb) {
    async.series([

            // Step 1: Method to validate packet
            function (callback) {

                if (eport.data.length != 18) {
                    EventLoggersHandler.logger.error(Messages.THIS_IS_AN_INVALID_DATA_PACKET_EXPECTING_18_BYTES);
                    return callback(new Error("Sorry! This is an invalid Data Packet. Expecting 18 bytes.", null));
                }

                return callback(null, null);

            },

            // Step 2: Method to update packet
            function (callback) {

                var stepNumber = 'A';
                var indicatorId = 0;
                var command = "0";
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 1, 2, stepNumber);
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 5, 6, command);
                eport.data = UtilsHandler.replaceStringWithIndexPosition(eport.data, 6, 7, indicatorId);

                return callback(null, null);

            }

        ],
        function (err, results) {

            if (err) {
                return cb(err, eport)
            }

            return cb(null, eport);

        });
};
// Method to generate Octal string
exports.generateControlNumber = function (number, width) {
    return new Array(width + 1 - (number + '').length).join('0') + number;
};

function zeroPad(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }

    return zeroString+n;
}

/* ************** For Bridge ************************** */


exports.loginUser = function (loginData, callback) {

    var username = loginData.username;
    var password = loginData.password;

    if (!username || !password) {
        var invalidInputError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
        invalidInputError.name = "UserError";
        return callback(invalidInputError, null);
    }
/*    if(username!='admin@mytrintrin.com') {
        Member.findOne({emailAddress: username}, function (err, data) {
            if (err) {
                return memId = '';
            }
            memId = data._id;
        });
    }*/
    User.findOne({$or: [{phoneNumber: username}, {email: username}]}, function (err, record) {

        var Id = record._id;
        var Role = record._type;
        if (err) {
            return callback(err, null);
        }

        if (!record) {
            var noUserError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
            noUserError.name = "UserError";
            return callback(noUserError, null);
        }

        if (!record.emailVerified) {
            return callback(new Error('Your Email Is Not Yet Verified'/*Messages.YOUR_EMAIL_IS_NOT_YET_VERIFIED_PLEASE_VERIFY_BEFORE_LOGGING_IN*/), null);
        }

        record.comparePassword(password, function (err, isMatch) {

            if (err || !isMatch) {
                var incorrectCredentialsError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
                incorrectCredentialsError.name = "UserError";
                return callback(incorrectCredentialsError, null);
            }

            record.userId = record._id;
            record = _.pick(record, 'email', '_type', 'phoneNumber', 'userID', 'createdAt');



            var TOKEN_EXPIRATION_HOURS = config.get("security.tokenExpiryHours");
            var TOKEN_EXPIRATION_MINUTES = 60 * TOKEN_EXPIRATION_HOURS;
            var TOKEN_EXPIRATION_TIME = 60 * TOKEN_EXPIRATION_MINUTES;

            var token = jwt.sign(record, config.get('security.secret'), {expiresIn: TOKEN_EXPIRATION_TIME});

            var tokenData = {
                token: token,
                expiresIn: TOKEN_EXPIRATION_TIME,
                id:Id,
                role:Role
            };

            return callback(null, tokenData);

        });

    });

};
