// Third Party Dependencies
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    compression = require('compression'),
    winston = require('winston'),
    expressWinston = require('express-winston'),
    config = require('config');

// Application Level Dependencies
var  ErrorHandler = require('./app/handlers/error-handler');

/*var routes = require('./routes/index');
var users = require('./routes/users');*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression({}));
app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.render('index', {title: 'PBS Bridge'});
});

//Middleware to decrypt the request object

/*app.use('/', routes);
app.use('/users', users);*/

// Middleware to read the request object to fetch user information


// Middleware to handle application level logging. It basically logs all requests and responses
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      level: config.get('logging.general.level'),
      filename: config.get('logging.general.file'),
      handleExceptions: true,
      json: true,
      maxsize: 20971520, //5MB
      maxFiles: 10,
      colorize: true
    })
  ],
  exitOnError: true
}));

require('./app/models');
require('./app/routes')(app);

// catch 404 and forward to error handler
// Middleware to handle "Resource Not Found" errors
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.name = "NotFoundError";
  err.status = 404;
  next(err, req, res, next);
});

// error handlers

// Middleware to log application level errors
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      level: config.get('logging.general.level'),
      filename: config.get('logging.general.file'),
      handleExceptions: true,
      json: true,
      maxsize: 20971520, //5MB
      maxFiles: 10,
      colorize: true
    })
  ],
  exitOnError: true
}));

// Middleware to handle application level errors
app.use(function (err, req, res, next) {
  ErrorHandler.processError(err, function (status, response) {
    res.status(status).json(response);
  });
});

module.exports = app;
