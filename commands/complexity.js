const escomplex = require('typhonjs-escomplex');
const Git = require('nodegit');
const fs = require('fs');
const rimraf = require('rimraf');
module.exports={
    command: ['complexity <tag>', 'get maintainability report '],
    action: function(args, callback){
        this.db.each(`SELECT * FROM applicants WHERE tag='${args.tag}'`, (err, row) => {
            if(err) return console.log(err);
            rimraf.sync('./tmp');
            Git.Clone(row.url, './tmp', {
                callbacks: {
                    certificateCheck: function() { return 1; }
                }
            }).then(() => {
                fs.readFile(`./tmp/${this.config.answerScript}`, 'utf8', (err, file) => {
                    if(err) console.log(err);
                    const analysis = escomplex.analyzeModule(file);
                    console.log(analysis);
                    this.db.run('UPDATE applicants SET complexity = $report WHERE tag = $tag', {
                        $tag: args.tag,
                        $report: JSON.stringify(analysis)
                    }, ()=>{
                        rimraf.sync('./tmp');
                        return callback();
                    });
                    // console.log(maintainability);
                });
            }).catch(err=>{
                console.log(err);
                return callback();
            });
        });
    }
};
