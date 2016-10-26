
var mongoose = require('mongoose');
var config = require('config');

var host = config.get('db.host'),
    port = config.get('db.port'),
    username = config.get('db.username'),
    password = config.get('db.password'),
    database = config.get('db.database'),

    dbUrl = 'mongodb://' + host + ':' + port + '/' + database;
var autoIncrement = require('mongoose-auto-increment');

if (username != '' && password !='') {

    var options = {
        user: username,
        pass: password
    };

    mongoose.connect(dbUrl, options);

} else {

  autoIncrement.initialize(mongoose.connect(dbUrl));

}
require('./user');
require('./admin');

require('./port');