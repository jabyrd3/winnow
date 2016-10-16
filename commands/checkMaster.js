const rimraf = require('rimraf');
const Git = require('nodegit');
const jsdom = require('jsdom');
const _ = require('lodash');
module.exports = {
    command: ['check <tag>', 'runs check against master on the tags branch, runs and compares results.'],
    action: function(args, callback) {
        this.db.each(`SELECT * FROM applicants WHERE tag='${args.tag}'`, (err, row) => {
            if (err) {
                console.log(err);
            }
            rimraf.sync('tmp');
            Git.Clone(row.url, 'tmp').then(() => {
                // here is where we run the tests
                // debug
                // var virtualConsole = jsdom.createVirtualConsole();
                // virtualConsole.on('log', function(message) {
                //     console.log('console.log called ->', message);
                // });
                jsdom.env({
                    file: `${__dirname.replace('/commands', '')}/tmp/${this.config.indexPath}`,
                    scripts: this.config.scripts,
                    // debug
                    // virtualConsole: virtualConsole,
                    created: (error, window) => {
                        if (error) {
                            console.log(error);
                        }
                        window.doneTrigger = (success, state) => {
                            if (_.isEqual(success, state)) {
                                console.log('checks out');
                                this.db.run('UPDATE applicants SET lastpass = strftime(\'%s\',\'now\') WHERE tag = $tag', {
                                    $tag: args.tag
                                });
                                rimraf.sync('tmp');
                                return callback();
                            } else {
                                console.log('they screwed somthing up');
                                this.db.run('UPDATE applicants SET lastfail = strftime(\'%s\',\'now\') WHERE tag = $tag', {
                                    $tag: args.tag
                                }, function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    rimraf.sync('tmp');
                                    return callback();
                                });
                            }
                        };
                    },
                    onload: function(window) {
                        window.onload();
                    }
                });
            }).catch(function(err) {
                console.log('i regret to inform you that there has been a catastrophic oops', err);
                rimraf.sync('tmp');
            });
        });
    }
};
