/**
 * Created by green on 10/11/16.
 */


    require('../app/models/checkout');
    require('../app/models/checkin');

var upload = require('./upload-service');
var checkOutStartup = 1;
var checkInStartup = 1;
setInterval(function () {
    //console.log('Timeout');
upload.Checkoutuploader(function (err,result) {
    if(err)
    {
        console.log('upload checkoutError');
        return;
    }

/*
setTimeout(function () {*/
   /*
},10000);*/

}
);

},1000);

setInterval(function () {
   // console.log('Timeout');
upload.Checkinuploader(function (err,result) {
    if(err)
    {
        console.log('Upload checkin Error');
       // return;
    }

});
},3000);
/*

if(checkInStartup == 1)
{
    console.log('Upload checkin success');
    checkInStartup = 0;

}*/
