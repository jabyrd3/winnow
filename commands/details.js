module.exports = {
    command: ['details <tag>', 'get details on applicant'],
    action: function(args, callback) {
        this.db.get('SELECT * FROM applicants WHERE tag = $tag', {
            $tag: args.tag
        }, (err, row) => {
            if (err) { console.log('oops', err); }
      
            console.log(`${row.tag} @ ${row.email} \n url: ${row.url} \n passed: ${this.utils.formatUnix(row.lastpass)} \n failed: ${this.utils.formatUnix(row.lastfail)}`);
            return callback();
        });
    }
};
