var Member = require('../models/member'),
    fs = require('fs'),
    UploadHandler = require('../handlers/upload-handler'),
    uuid = require('node-uuid'),
    async=require('async'),
    MembershipService=require('../services/membership-service'),
    PaymentTransaction=require('../services/payment-transaction'),
    Messages = require('../core/messages'),
    Constants =require('../core/constants'),
    Transaction = require('../models/payment-transactions'),
    Card = require('../models/card'),
    CardService = require('../services/card-service'),
    User=require('../models/user');

exports.createMember=function (record,callback) {

 /*   var memberData={
      name:record.Name,
        phoneNumber
        address
        city
        country
    };
    */
    var documents = [];
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
 async.series([
     function (callback) {
         documents = record.documents;
         record.documents = [];
         Member.create(record,function (err,result) {
             if(err)
             {
                 return callback(err,null);
             }
             memberDetails=result;
             return callback(null,result);
         });
     },
     function (callback) {
         if (documents) {

             for (var i = 0; i < documents.length; i++) {

                 var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails._id+"/";

                 if (!fs.existsSync(dir)){
                     fs.mkdirSync(dir);
                 }
                 //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                 var docNumber = i + uuid.v4();
                 var docFilePath = dir+ docNumber+".png";

                 // Check if there is a new document available
                 if (documents[i].documentCopy.result) {

                     var decodedDoc = new Buffer(documents[i].documentCopy.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                     /*var fileDetails = {
                         key: config.get('aws.bucket') + config.get('awsFolders.member') + memberObject.memberId + '/' + docNumber + '.png',
                         filePath: docFilePath
                     };*/
                     var fileDetails = {
                         key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails._id + '/ ' + docNumber + '.png',
                         filePath: docFilePath
                     };

                     // Method to write Multiple files
                     var writeFiles = {
                         filePath: docFilePath,
                         file: decodedDoc,
                         fileName: docNumber
                     };

                     filesArrayToWrite.push(writeFiles);
                     filesArray.push(fileDetails);

                     documents[i].documentCopy = docNumber;

                 }

                 // removing document name if type not Other
                 if (documents[i].documentType != "Other") {
                     documents[i].documentName = "";
                 }

                 //filesToDelete.push(docFilePath);
             }

             return callback(null, null);
         } else {
             return callback(null, null);
         }
     },
     function (callback) {

         if (filesArrayToWrite.length > 0) {

             UploadHandler.writeFile(filesArrayToWrite, function (err) {

                 if (err) {
                     return callback(err, null);
                 }

                 return callback(null, null);
             });

         } else {
             return callback(null, null);
         }

     },

     function (callback) {

         var docArray = [];

         Member.findById(memberDetails._id, function (err, result) {

             if (err) {
                 return callback(err, null);
             }

             if (documents) {

                 for (var i = 0; i < documents.length; i++) {

                     var docDetails = {
                         documentType: documents[i].documentType,
                         documentNumber: documents[i].documentNumber,
                         documentCopy: documents[i].documentCopy,
                         documentName: documents[i].documentName,
                         description: documents[i].description
                     };

                     docArray.push(docDetails);
                 }
             }

             if (record.profilePic) {
                 result.picture = record.profilePic;
             }
             result.documents = docArray;

             Member.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                 if (err) {
                     return callback(err, null);
                 }

                 memberDetails = result;
                 return callback(null, result);
             });

         });
     }


 ],function (err,result) {
    if(err)
    {
        return callback(err,null);
    }
    return callback(null,memberDetails);
 });

};


exports.updateMember = function (record,callback) {

   //var documents = [];
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    async.series([
        function (callback) {
            if (record.documents) {

                for (var i = 0; i < record.documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Member/'+record._id+"/";

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                    var docNumber = i + uuid.v4();
                    var docFilePath = dir+ docNumber+".png";

                    // Check if there is a new document available
                    if (record.documents[i].documentCopy.result) {

                        var decodedDoc = new Buffer(record.documents[i].documentCopy.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                        /*var fileDetails = {
                         key: config.get('aws.bucket') + config.get('awsFolders.member') + memberObject.memberId + '/' + docNumber + '.png',
                         filePath: docFilePath
                         };*/
                        var fileDetails = {
                            key: '/usr/share/nginx/html/mytrintrin/Member/' + record._id + '/ ' + docNumber + '.png',
                            filePath: docFilePath
                        };

                        // Method to write Multiple files
                        var writeFiles = {
                            filePath: docFilePath,
                            file: decodedDoc,
                            fileName: docNumber
                        };

                        filesArrayToWrite.push(writeFiles);
                        filesArray.push(fileDetails);

                        record.documents[i].documentCopy = docNumber;

                    }

                    // removing document name if type not Other
                    if (record.documents[i].documentType != "Other") {
                        record.documents[i].documentName = "";
                    }

                    //filesToDelete.push(docFilePath);
                }

                return callback(null, null);
            } else {
                return callback(null, null);
            }
        },
        function (callback) {

            if (filesArrayToWrite.length > 0) {

                UploadHandler.writeFile(filesArrayToWrite, function (err) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, null);
                });

            } else {
                return callback(null, null);
            }

        },

        function (callback) {

            var docArray = [];

            /*Member.findById(memberDetails._id, function (err, result) {

                if (err) {
                    return callback(err, null);
                }*/

                if (record.documents) {

                    for (var i = 0; i < record.documents.length; i++) {

                        var docDetails = {
                            documentType: record.documents[i].documentType,
                            documentNumber: record.documents[i].documentNumber,
                            documentCopy: record.documents[i].documentCopy,
                            documentName: record.documents[i].documentName,
                            description: record.documents[i].description
                        };

                        docArray.push(docDetails);
                    }
                }

                if (record.profilePic) {
                    record.picture = record.profilePic;
                }
                //result.documents = docArray;

                Member.findByIdAndUpdate(record._id, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });

            //});
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberDetails);
    });


};

exports.assignMembership=function (memberId, membershipId,callback) {

   // var validity;

    async.series([

           /* // Step 1: Method to calculate balance and validity
            function (callback) {

                MembershipService.calculateValidity(membershipId, memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    validity = result;
                    return callback(null, result);
                });
            },*/

            // Step 2: Method to update Member validity
            function (callback) {

                Member.findByIdAndUpdate(memberId, {
                    $set: {
                        //'validity': validity,
                        'membershipId': membershipId
                    }
                }, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, result);

                });
            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, result);

        }
    );

};

exports.addCard = function (memberId, cardNumber, membershipId, callback) {

    var cardObject;
    var memberObject;
    var memberName;

    async.series([
        /*function (callback) {

        },*/

            // Step 1: Method to check for any assigned cards
            function (callback) {

                User.findById(memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    memberName = result.Name;
                    if (result.cardNum) {

                        CardService.deactivateCard(result.cardNum, function (err, result) {

                            if (err) {
                                return callback(null, null);
                            }

                            return callback(null, result);
                        });

                    } else {
                        return callback(null, null);
                    }
                });

            },

            // Step 2: Method to verify and update card
            function (callback) {

                CardService.cardAvailableForMember(cardNumber, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    result.status = Constants.CardStatus.ACTIVE;
                    result.membershipId = membershipId;
                    result.assignedTo = memberId;
                    result.assignedToName = memberName;

                    Card.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        cardObject = result;
                        return callback(null, result);
                    });

                });
            },

            // Step 3: Method to update member card details
            function (callback) {

                Member.findByIdAndUpdate(memberId, {
                    $set: {
                        'cardNum':cardObject.cardNumber,
                        'smartCardId': cardObject._id,
                        'smartCardNumber': cardObject.cardRFID
                    }
                }, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberObject = result;
                    return callback(null, result);
                });

            }

        ],

        function (err) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, memberObject);

        }
    );

};

exports.creditMember=function (id,record,callback) {

    var memberObject;
    var updatedMemberObject;
    var isProcessingFeeDeducted = false;
    var amount = 0;
    var transObject;
    var transactionDetails=0;
    var validity;

    async.series([

        function (callback) {

            Member.findById(id, function (err, result) {

                if (err) {
                    return callback(err, null);
                }

                if (!result) {
                    return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                }

                if (result.processingFeesDeducted) {
                    isProcessingFeeDeducted = true;
                }

                memberObject = result;
                return callback(null, result);
            })

        },
        function (callback) {
           /* var orderId = 'PBS'+ new Date().getTime();*/
            if(isProcessingFeeDeducted)
            {
                PaymentTransaction.existingMember(memberObject,record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    updatedMemberObject=result;
                    return callback(null,result);
                });
/*
                   transObject={
                       memberId:memberObject._id,
                       invoiceNo: orderId,
                       paymentDescription:Constants.PayDescription.CREDIT_NOTE,
                       paymentMode:record.creditMode,
                       paymentThrough:Constants.PayThrough.POS,
                       gatewayTransactionId:record.transactionNumber,
                       comments:record.comments,
                       credit:record.credit,
                       balance:record.credit
                   };
                   Transaction.create(transObject,function (err,result) {
                       if(err)
                       {
                           return callback(err,null);
                       }
                       transactionDetails=result;
                       return callback(null,result);
                   });*/
            }
            else
            {
                PaymentTransaction.newMember(memberObject,record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    updatedMemberObject=result;
                    return callback(null,result);
                });

            }

        }/*,
        function (callback) {
            if(transactionDetails!=0)
            {
                memberObject.creditBalance=transactionDetails.balance;
                Member.findByIdAndUpdate(memberObject._id,memberObject,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberObject=result;
                    return callback(null,result);
                });
            }
        }*/


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,updatedMemberObject);
    });

};