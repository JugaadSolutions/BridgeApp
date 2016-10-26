var async = require('async');

var Card = require('../models/card'),
    /*Member = require('../models/member'),
    Employee = require('../models/employee'),*/
    Constants = require('../core/constants'),
    User = require('../models/user'),
    Messages = require('../core/messages');

exports.deactivateCard = function (id, callback) {

    var memberObject;
    var assignedToId;
    var cardObject;

    async.series([

            // Step 1: Method to validate card
            function (callback) {

                Card.findOne({'cardNumber':id}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_CARD_FOUND, null));
                    }
                    cardObject=result;
                    return callback(null, result);

                });

            },

            // Step 1: Method to remove card from member
            function (callback) {

                User.findOne({'cardNum': id}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(null, null);
                    }

                    User.findByIdAndUpdate(result._id, {
                        $unset: {
                            cardNum:id,
                            smartCardId: result.smartCardId,
                            smartCardNumber: result.smartCardNumber
                        }
                    }, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        memberObject = result;
                        assignedToId = result._id;
                        return callback(null, result);
                    });
                });

            },

            // Step 3: Method to change card status to inactive
            function (callback) {

                Card.findByIdAndUpdate(cardObject._id, {
                    $unset: {assignedTo: assignedToId},
                    status: Card.CardStatus.INACTIVE
                }, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    cardObject = result;
                    return callback(null, result);
                });

            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, cardObject);

        }
    );
};

exports.cardAvailableForMember = function (cardNumber, callback) {

    var cardObject;

    async.series([

            // Step 1: Method to verify card status
            function (callback) {

                Card.findOne({'cardNumber': cardNumber}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_CARD_FOUND, null));
                    }

                    if (result.length == 0) {
                        return callback(new Error(Messages.INVALID_CARD_NUMBER_PLEASE_TRY_AGAIN));
                    }

                    if (result.status == Constants.CardStatus.ACTIVE) {
                        return callback(new Error(Messages.THIS_CARD_HAS_ALREADY_BEEN_ASSIGNED_TO_A_USER));
                    }

                    /*if (result.cardLevel != Card.CardLevel.CHECK_OUT_CARD) {
                        return callback(new Error(Messages.WRONG_CARD_TYPE_YOU_CANNOT_ASSIGN_THIS_CARD_TO_A_MEMBER));
                    }
*/
                    /*if (result.cardType != Card.CardType.REGISTERED_MEMBER) {
                        return callback(new Error(Messages.THIS_CARD_CANNOT_BE_ASSIGNED_TO_A_MEMBER));
                    }*/

                    cardObject = result;
                    return callback(null, result);

                });

            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, cardObject);

        }
    );

};