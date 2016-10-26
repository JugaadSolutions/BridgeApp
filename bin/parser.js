//var q = require('./queue');

module.exports=function (rec,callback) {
    if(rec.length>0)
    {
        console.log(rec .shift());
    }
return callback();
};
