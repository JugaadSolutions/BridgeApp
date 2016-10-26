var config = require('config'),
    fs = require('fs'),
    mime = require('mime'),
    zlib = require('zlib'),
    AWS = require('aws-sdk'),
    async = require('async');

AWS.config.loadFromPath('./aws-config.json');

// Method to write multiple files
exports.writeFile = function (filesArray, callback) {

    async.each(filesArray, function (file, callback) {

        fs.writeFile(file.filePath, file.file, function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, result);

        });

    }, function (err, result) {

        if (err) {
            return callback(err, null);
        }
        else {
            return callback(err, result);
        }
    });

};

// Method to create array of file details
exports.uploadFileToAWS = function (filesArray, callback) {

    /*async.each(filesArray, function (file, callback) {

     uploadSingleFile(file, callback);

     }, function (err, result) {

     if (err) {
     return callback(err, null);
     }
     else {
     return callback(err, result);
     }
     });*/
    uploadSingleFile(filesArray, callback);

};

// Method to upload single file
const uploadSingleFile = function (filesArray, callback) {

    async.each(filesArray, function (file, callback) {

        var contentType = mime.lookup(file.filePath);

        var fileStream = fs.createReadStream(file.filePath);

        fileStream.on('error', function (err) {

            return callback(err, null);

        });

        fileStream.on('open', function () {

            var s3 = new AWS.S3();

            var params = {
                "Bucket": config.get('aws.bucket'),
                "Key": file.key,
                "Body": fileStream,
                "ACL": 'public-read',
                "ContentType": contentType
            };

            s3.upload(params, function (err, data) {

                if (err) {
                    return callback(err, null);
                }

                console.log(data);

                return callback(null, data);
            });

        });

    }, function (err, result) {

        if (err) {
            return callback(err, null);
        }
        else {
            return callback(err, result);
        }
    });

};