/**
 * Created by green on 10/11/16.
 */


    require('../app/models/checkout');
    require('../app/models/checkin');

var upload = require('./upload-service');
var ReconsileService = require('../app/services/reconsile-service');

setInterval(function () {
    //console.log('Timeout');
upload.Checkoutuploader(function (err,result) {
    if(err)
    {
        console.log('upload checkoutError');
        return;
    }
}
);

},1000);

setInterval(function () {
   // console.log('Timeout');
upload.Checkinuploader(function (err,result) {
    if(err)
    {
        console.log('Upload checkin Error');
        return;
    }

});
},3000);

//setTimeout(function () {
setInterval(function () {
    // console.log('Timeout');
    ReconsileService.reconcile(function (err,result) {
        if(err)
        {
            console.error('Error reconcilation '+err);
            //return;
        }

    });
},5000);