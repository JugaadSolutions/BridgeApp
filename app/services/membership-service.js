var async = require("async");

// Application Level Dependencies
var Membership = require('../models/membership'),
    Member = require('../models/member'),

    Messages = require('../core/messages');



exports.calculateValidity = function (membershipId, memberId, callback) {

    var calculateMembership = false;

    var validity;

    async.series([

            function (callback) {

                Member.findById(memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (!result.processingFeesDetected) {
                        calculateMembership = true;
                    } else {
                        validity = result.validity;
                        return callback(null, validity);
                    }

                    return callback(null, result);
                });

            },

            // Step 1: Method to verify card and update
            function (callback) {

                if (calculateMembership) {

                    Membership.findById(membershipId, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBERSHIP_FOUND), null);
                        }

                        var currentDate = new Date();
                        currentDate.setDate(currentDate.getDate() + result.validity);
                        validity = currentDate;

                        return callback(null, validity);

                    });

                } /*else {
                    Membership.findById(membershipId, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBERSHIP_FOUND), null);
                        }

                        var date1 = new Date("12/28/2010");
                        var date2 = new Date("12/15/2010");
                        var timeDiff = date1.getTime() - date2.getTime() ;
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        var currentDate = new Date();


                        var timeDiff = currentDate.getTime() - validity.getTime();
                        if(timeDiff<0)
                        {
                            validity.setDate(validity + result.validity);
                            validity = currentDate;
                        }
                        else
                            {

                            }


                        return callback(null, validity);

                    });
                }*/
            }

        ],

        function (err) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, validity);

        }
    );

};