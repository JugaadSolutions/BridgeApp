/**
 * Created by green on 10/11/16.
 */


    require('../app/models/checkout');
    require('../app/models/checkin');

var upload = require('./upload-service');
setInterval(function () {
    console.log('Timeout');
upload.uploader(function (err,result) {
    if(err)
    {
        console.log('Error');
        //return;
    }

/*
setTimeout(function () {*/
   /*
},10000);*/
    console.log('Upload checkout success');


});

},10000);

setInterval(function () {
    console.log('Timeout');
upload.Checkinuploader(function (err,result) {
    if(err)
    {
        console.log('Error');
        return;
    }
    console.log('Upload checkin success');
});
},30000);