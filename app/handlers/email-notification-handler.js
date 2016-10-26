// Third party dependencies
var config = require('config'),
    request = require('request'),
    swig = require("swig");

exports.sendMail = function (emailMessage) {

    const notificationEnabled = config.get("emailNotification.enabled");

    if (!notificationEnabled) {
        return;
    }

    const fromEmail = config.get("emailConfig.fromEmail");
    const fromName = config.get("emailConfig.fromName");
    const replyTo = config.get("emailConfig.replyTo");

    emailMessage.fromEmail = fromEmail;
    emailMessage.fromName = fromName;
    emailMessage.replyTo = replyTo;

    var req = {
        url: config.get("utils.baseUrl") + config.get("utils.email.endPoint"),
        method: config.get("utils.email.method"),
        headers: {
            "content-type": "application/json"
        },
        json: emailMessage
    };

    request(req, function (err, result) {

        if (err) {
            console.log("Couldn't send email! " + err);
            return;
        }

        if (result.body.error) {
            console.log("Couldn't send email! " + result.body.message);
            return;
        }

        console.log("Email sent! " + result);

    });

};

exports.renderHtmlTemplate = function (filePath, data) {
    return swig.renderFile(filePath, data);
};

exports.renderTextTemplate = function (text, data) {

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    return text.format(data.profileName, data.email, data.randomPassword);

};

exports.renderSignUpTemplate = function (text, data) {

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    return text.format(data.pbNumber);

};