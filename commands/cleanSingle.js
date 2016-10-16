const request = require('request');
const rimraf = require('rimraf');
module.exports={
    command: ['clean:tag <tag>', 'clear repo and all db records for tag'],
    action: function (args, callback) {
        this.db.get('SELECT * FROM applicants WHERE tag = $tag', {
            $tag: args.tag
        }, (err, row) => {
            if (err) { 
                console.log('oops', err); 
                return callback();
            }
            if(!row){
                console.log('there isn\'t a test with that tag');
                return callback();
            }
            request({
                method: 'DELETE',
                url: row.apiurl || 'wtf',
                headers: {
                    'User-Agent': 'winnow-code-test',
                    'Authorization': `token ${this.config.privToken}`
                }
            },err => {
                if (err) {
                    console.log('ooops', err);
                    rimraf.sync('tmp');
                }
              // console.log('response: ', res.status, res.body);
                this.db.run('DELETE FROM applicants WHERE tag = $tag', {$tag: args.tag}, function(err){
                    if(err){
                        console.log(err);
                    }
                    return callback();
                });
            });
        });    
    }
};
