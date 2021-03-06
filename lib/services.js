var spawn = require('child_process').spawn,
    Promise = require('bluebird'),
    temp = require('temp');

const startService = {
    redis: function() {
        return spawnAndWait('redis-server', [], 'Running')
    },
    mongodb: function() {
        var dir = temp.mkdirSync('mongodb')
        return spawnAndWait('mongod', ['--smallfiles', '--noprealloc', '--nojournal', '--dbpath',  dir], 'waiting for connections on port');
    },
    postgres: function() {
        return spawnAndWait('postgres', ['-D', '/home/codewarrior/pg'], 'ready to accept connections', 1000)
    },
    mariadb: function() {
        // TODO
    },
    couchdb: function() {
        // TODO
    },
    rabbitmq: function() {
        // TODO
    }
}

function spawnAndWait(cmd, args, text, timeout) {
    return new Promise(function(resolve, reject) {
        var s = spawn(cmd, args);
        s.stdout.on('data', function(data) {
            var str = data && data.toString();
            // console.log(str);  // for debugging only

            if (str && str.indexOf(text) > 0){
                resolve();
            }
        });

        s.on('exit', resolve);

        setTimeout(resolve, timeout || 3500);
    });
}

// loops through each requested service and returns once all services have started
module.exports.start = function(services, resolve) {
    return Promise.map(services || [], function(service){
        return startService[service]();
    }).finally(resolve);
}