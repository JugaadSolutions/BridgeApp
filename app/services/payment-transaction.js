var async = require('async'),
MembershipService=require('../services/membership-service'),
    Transaction=require('../services/payment-transaction'),
    Membership  = require('../models/membership'),
    Member = require('../models/member'),
    Payments = require('../models/payment-transactions'),
    Constants=require('../core/constants');


exports.existingMember = function (memberObject,record,callback) {
/*    var validity;
    var transObject;
    var transactionDetails;
    var orderId = 'PBS'+ new Date().getTime();
   async.series([
    function (callback) {
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
        });
    },
       //Method to calculate validity
       function (callback) {
           MembershipService.calculateValidity(membershipId, memberId, function (err, result) {

               if (err) {
                   return callback(err, null);
               }

               validity = result;
               return callback(null, result);
           });
       }

   ],function(err,result){
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,result);
   });*/

};

exports.newMember = function (memberObject,record,callback) {
    var memberShipObject=0;
    var finalTransaction=0;
    var transactionList=[];
    var validity;
    var updatedMember;
    async.series([
        function (callback) {
            Membership.findById(memberObject.membershipId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberShipObject = result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(memberShipObject!=0)
            {
                    var userfeeDeposit;
                    var uf = 'PBS'+ new Date().getTime();
                    userfeeDeposit={
                        memberId:memberObject._id,
                        invoiceNo: uf,
                        paymentDescription:Constants.PayDescription.CREDIT_NOTE,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        credit:record.credit,
                        balance:record.credit
                    };

                    var securityObject;
                    var sd = 'PBS'+ new Date().getTime();
                        record.credit=record.credit-memberShipObject.securityDeposit;
                    securityObject={
                        memberId:memberObject._id,
                        invoiceNo: sd,
                        paymentDescription:Constants.PayDescription.SECURITY_DEPOSIT,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.securityDeposit,
                        balance:record.credit
                    };

                    var cardObject;
                    var cd = 'PBS'+ new Date().getTime();
                    record.credit=record.credit-memberShipObject.smartCardFees;
                    cardObject={
                        memberId:memberObject._id,
                        invoiceNo: cd,
                        paymentDescription:Constants.PayDescription.SMART_CARD_FEE,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.smartCardFees,
                        balance:record.credit
                    };
                    transactionList.push(userfeeDeposit);
                    transactionList.push(securityObject);
                    transactionList.push(cardObject);
                    if(memberShipObject.processingFees!=0)
                    {
                        var processingObject;
                        var ps = 'PBS'+ new Date().getTime();
                        record.credit=record.credit-memberShipObject.processingFees;
                        processingObject={
                            memberId:memberObject._id,
                            invoiceNo: ps,
                            paymentDescription:Constants.PayDescription.PROCESSING_FEE,
                            paymentMode:record.creditMode,
                            paymentThrough:Constants.PayThrough.POS,
                            gatewayTransactionId:record.transactionNumber,
                            comments:record.comments,
                            debit:memberShipObject.processingFees,
                            balance:record.credit
                        };
                        transactionList.push(processingObject);

                    }
                    return callback(null,null);

            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(transactionList.length>0)
            {
                for(var i=0;i<transactionList.length;i++)
                {
                    Payments.create(transactionList[i],function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        finalTransaction=result;
                    });
                }
            }
            return callback(null,null);
        },
        function (callback) {
            if(finalTransaction!=0)
            {
                MembershipService.calculateValidity(memberObject.membershipId, memberObject._id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    validity = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(finalTransaction!=0)
            {
                Member.findByIdAndUpdate(memberObject._id,{
                    $set: {
                        'validity': validity,
                        'processingFeesDeducted':true,
                        'creditBalance':finalTransaction.balance,
                        'securityDeposit':memberShipObject.securityDeposit,
                        'smartCardFees': memberShipObject.smartCardFees,
                        'processingFees':memberShipObject.processingFees
                    }
                },function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    updatedMember=result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,updatedMember);
    });
};