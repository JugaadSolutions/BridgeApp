// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var
    RedistributionPort = require('../models/redistribution-port'),
    Messages = require('../core/messages');



exports.createPort=function (record,callback) {
    RedistributionPort.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getAllRecords=function (record,callback) {
  RedistributionPort.find({'_type':'Redistribution-area'},function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};