var config = require('config'),
    crypto = require('crypto');

const algorithm = config.get('encrypt.algorithm'),
    password = config.get('encrypt.password');

exports.encrypt = function (text) {

    text = JSON.stringify(text);

    var cipher = crypto.createCipher(algorithm, password);

    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;

};

exports.decrypt = function (text) {

    var decipher = crypto.createDecipher(algorithm, password);

    var decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);

};
