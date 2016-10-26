
var routes = require('node-require-directory')(__dirname),
    unless = require('express-unless');

module.exports = function (app) {

    Object.keys(routes).forEach(function (key) {

        /* if (config.get('security.enabled')) {
         app.use('/api/' + removeDashes(key), jwt({secret: config.get('security.secret')}).unless(SecurityHandler.checkWhitelist), SecurityHandler.authorizeUser(), routes[key]);
         return;
         }
         */
        app.use('/api/' + removeDashes(key), routes[key]);

    });
};

function removeDashes(string) {
    return string.replace(/-/g, '');
}