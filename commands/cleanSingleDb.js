module.exports={
    command: ['clean:tag:db <tag>', 'clear from db only'],
    action: function(args, callback){
        this.db.get('SELECT * FROM applicants WHERE tag = $tag', {
            $tag: args.tag
        }, function(err) {
            if (err) { console.log('oops', err); }
            this.db.run('DELETE FROM applicants WHERE tag = $tag', {$tag: args.tag}, function(err){
                if(err){
                    console.log(err);
                }
                return callback();
            });
        });
    }
};


