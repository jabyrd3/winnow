var request = require('request');
var rimraf = require('rimraf');
module.exports={
    command: ['clean:repos', 'clear all winnow repos from github'],
    action: function(args, callback) {
        this.db.each('SELECT * FROM applicants', (err, row) => {
            if (err) {
                console.log(err);
                return callback();
            }
            request({
                method: 'DELETE',
                url: row.apiurl,
                headers: {
                    'User-Agent': 'winnow-code-test',
                    'Authorization': `token ${this.config.privToken}`
                }
            },
                function(err) {
                    if (err) {
                        console.log('ooops', err);
                        rimraf.sync('tmp');
                        return callback();
                    }
                    return callback();
                });
        });
    }
};

