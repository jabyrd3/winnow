var rimraf = require('rimraf');
module.exports = {
    command: ['clean:tmp', 'removes tmp dir'],
    action: function(args, callback) {
        rimraf.sync('tmp');
        return callback();
    }
};
