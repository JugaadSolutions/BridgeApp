/**
 * Created by kiranniranjan on 8/9/16.
 */
var winston = require('winston'),
    config = require('config');

var customLevels = {
    levels: {error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5},
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        verbose: 'green',
        debug: 'yellow',
        silly: 'green'
    }
};

winston.config.addColors(customLevels.colors);

exports.logger = new (winston.Logger)({
    levels: customLevels.levels,
    transports: [
        new winston.transports.File({
            filename: config.get('logging.event.file'),
            json: false,
            maxsize: 20971520,
            maxFiles: 10,
            handleExceptions: true
        }),
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ]
});

