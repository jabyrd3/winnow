const rimraf = require('rimraf');
module.exports = {
    command: ['clean:db', 'clean db'],
    action: function(args, callback) {
        rimraf.sync('winnow.data');
        return callback();
    }
};
