console.log('lolbutts', this);
const table = require('../rendervtable.js');
module.exports = {
    command: ['list', 'lists emails and tags'],
    action: function(args, callback) {
        this.db.all('SELECT * FROM applicants', (err, rows) => {
            if (err) {
                console.log(err);
                return callback();
            }
            var collection = [];
            rows.forEach((row) => {
                if (row) {
                    collection.push({ tag: row.tag, 'passed': this.utils.formatUnix(row.lastpass), 'failed': this.utils.formatUnix(row.lastfail) });
                }
            });
            if (rows.length > 0) {
                table(collection);
            } else {
                console.log('no tests have been sent');
            }
            return callback();
        });
    }
};
