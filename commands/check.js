const request = require('request');
const rimraf = require('rimraf');
const crypto = require('crypto');
const Git = require('nodegit');
const jsdom = require('jsdom');
module.exports = {
    command: ['check:pr <tag>', 'last pr against master; merges and compares results.'],
    action: function(args, callback) {
        this.db.each(`SELECT * FROM applicants WHERE tag='${args.tag}'`, (err, row) => {
            if (err) console.log(err);
            rimraf.sync('../tmp');
            request.get({
                url: `https://${this.config.privToken}:x-oauth-basic@api.github.com/repos/${this.config.gitUserName}/${args.tag}-${crypto.createHash('md5').update(args.tag + ' ' + row.email).digest('hex')}/pulls`,
                headers: {
                    'User-Agent': 'winnow-code-test'
                },
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    return callback();
                }
                if (JSON.parse(res.body).length === 0) {
                    console.log('no change since your last check!');
                    return callback();
                } else {
                    res.body = JSON.parse(res.body);
                    request.post({
                        url: `https://${this.config.privToken}:x-oauth-basic@api.github.com/repos/${this.config.gitUserName}/${args.tag}-${crypto.createHash('md5').update(args.tag + ' ' + row.email).digest('hex')}/merges`,
                        headers: {
                            'User-Agent': 'winnow-code-test'
                        },
                        json: {
                            base: 'master',
                            head: res.body[0].merge_commit_sha,
                            commit_message: 'moment of truth'
                        }
                    }, err => {
                        if (err) {
                            console.warn('merge failed:', err);
                            return callback();
                        }
                        Git.Clone(row.url, '../tmp').then(() => {
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
                                created: function(error, window) {
                                    if (error) {
                                        console.log(error);
                                    }
                                    window.doneTrigger = function(success, state) {
                                        if (_.isEqual(success, state)) {
                                            console.log('checks out');
                                            this.db.run('UPDATE applicants SET lastpass = strftime(\'%s\',\'now\') WHERE tag = $tag', {
                                                $tag: args.tag
                                            });
                                            rimraf.sync('../tmp');
                                            return callback();
                                        } else {
                                            console.log('they screwed somthing up');
                                            this.db.run('UPDATE applicants SET lastfail = strftime(\'%s\',\'now\') WHERE tag = $tag', {
                                                $tag: args.tag
                                            }, function(err) {
                                                if (err) {
                                                        console.log(err);
                                                    }
                                                rimraf.sync('../tmp');
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
                            rimraf.sync('../tmp');
                        });
                    });
                }
            });
        });
    }
};
