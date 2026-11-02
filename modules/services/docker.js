const Docker = require('dockerode');
const docker = new Docker();
// const docker = new Docker({
//     protocol: 'http',
//     host: '0.0.0.0',
//     port: 8030
// });
// const container = docker.getContainer('c903fad25f44038e6ef1b3eb4c085146d59b69430b6713f3544925d0b14afcdb');

const DockerService = {
    createContainer: function() {
        docker.createContainer({
            Image: 'r-base',
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
            OpenStdin: false,
            StdinOnce: false
          }).then(function(container) {
            auxContainer = container;
            return auxContainer.start();
          }).then(function(data) {
            return auxContainer.resize({
              h: process.stdout.rows,
              w: process.stdout.columns
            });
          }).then(function(data) {
            return auxContainer.stop();
          }).then(function(data) {
            return auxContainer.remove();
          }).then(function(data) {
            console.log('container removed');
          }).catch(function(err) {
            console.log(err);
          });
    },
    getContainer: function () {        
        return container;
    },
    copyFile: function (file) {
        docker.listContainers(function(err, containers) {
            console.log(containers);
        })
        // console.log('Container', container);
        // container.putArchive(file);
        // docker.run('node', ['bash', '-c', 'cd /sync; npm install; npm start'], [process.stdout, process.stderr], {
        //     name: 'ubuntu-test',
        //     Volumes: {
        //         '/sync': {}
        //     },
        //     "HostConfig": {
        //         "Binds": [syncFolder + ':/sync']
        //     }
        // },
        //     function (err, data, container) {
        //         // Called when container stop
        //         if (err)
        //             throw err;
                
        //         console.log('Container Stop - data', data);
        //         console.log('Container Stop - container', container);
        //     })
        //     .on('container', function (container) {
        //         // Container is UP
        //         console.log('Container up - container', container);
        //     });
    }
};

module.exports = DockerService;