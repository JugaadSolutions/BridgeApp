/**
 * Created by green on 10/11/16.
 */


    require('../app/models/checkout');
    require('../app/models/checkin');

var upload = require('./upload-service');
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
       // return;
    }

});
},3000);

