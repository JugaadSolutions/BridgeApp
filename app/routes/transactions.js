/**
 * Created by root on 15/6/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var  Messages = require('../core/messages');
var Transaction = require('../services/transaction');

var router = express.Router();

// Router Methods
router

    .delete('/', function (req, res, next) {
        console.log("Checkin Checkout entries clearence initiated ");
        Transaction.clearAll(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data:result});

            }

        });
    })

;
module.exports = router;