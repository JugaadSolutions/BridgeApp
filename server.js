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
                require('./bin/userArray');
                require('./bin/blacklistUser');
                require('./bin/eport');
                require('./bin/eMemberPlans');
                require('./bin/pbs-bridge');
                require('./bin/port-communication');
                require('./bin/serverbridge');
                //require('./bin/rabbitmq_sub');
                require('./bin/rabbitEasy_sub');
                console.log('All servers Restarted');
                conn=0;
            }
        }
        /* obj should be:

         { name: 'eth0',
         ip_address: '10.0.1.3',
         mac_address: '56:e5:f9:e4:38:1d',
         type: 'Wired',
         netmask: '255.255.255.0',
         gateway_ip: '10.0.1.1' }

         */
    });
},2000);


/*
p.printIt(function (res) {
    console.log('Server : '+res);
});*/
