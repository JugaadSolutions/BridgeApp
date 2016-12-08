var network = require('network');
var conn = 1;
setInterval(function(){
    network.get_active_interface(function(err, obj) {
        if(err)
        {
            console.log('No Network interface Detected');
            conn = 1;
        }
        if(obj)
        {
            if(conn==1)
            {
                //console.log(obj);
                require('./bin/eport');
                require('./bin/eMemberPlans');
                require('./bin/pbs-bridge');
                require('./bin/port-communication');
                require('./bin/serverbridge');
                console.log('All servers Restarted');
                conn=0;
            }
        }

    });
},2000);