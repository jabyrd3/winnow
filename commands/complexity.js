let escomplex = require('typhonjs-escomplex');
let Git = require('nodegit');
let fs = require('fs');
let rimraf = require('rimraf');
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
            }).then(repo => {
                fs.readFile(`./tmp/${this.config.answerScript}`, 'utf8', function(err, file){
                    if(err) console.log(err);
                    console.log('fileread');
                    const analysis = escomplex.analyzeModule(file);
                    console.log(analysis.maintainability);
                    // rimraf.sync('./tmp');
                    return callback();
                });
            }).catch(err=>{
              console.log(err);
              return callback();
            });
        });
    }
};
