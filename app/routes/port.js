/**
 * Created by root on 8/5/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var  Messages = require('../core/messages');
var PortService = require('../services/port-service');

var router = express.Router();

// Router Methods
router

    .put('/', function (req, res, next) {
        console.log("Port Status changed to : "+req.body.portStatus);
        PortService.updatePort( req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data:result});

            }

        });
    })

;
module.exports = router;