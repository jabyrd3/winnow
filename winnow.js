var vorpal = require('vorpal')();
var sqlite3 = require('sqlite3')
    .verbose();
var db = new sqlite3.Database('./winnow.data');
var Git = require("nodegit");
var UglifyJS = require("uglify-js");
var rimraf = require('rimraf');
var exec = require('sync-exec');
var request = require('request');
var config = require('./config.js');
var fs = require('fs');
var canvas = require('canvas');
var jsdom = require('jsdom');
var _ = require('lodash');
var crypto = require('crypto');
db.serialize(function() {
    // quick and dirty db setup
    db.run("CREATE TABLE IF NOT EXISTS applicants (email TEXT, tag TEXT, url TEXT); ", [], function(err, rows) {});
});
vorpal
    .command('send <email> <tag>', 'create hashed branch of config, sends code test to email, tags email with name and saves all data.')
    .action(function(args, callback) {
        Git.Clone(config.testSource, "./tmp")
            .then(function(repo) {
                rimraf.sync('tmp/.git');
                config.obfuscate.forEach(function(path) {
                    var obfuscate = UglifyJS.minify(path);
                    fs.writeFileSync(path, obfuscate.code, 'utf8');
                });
                exec('cd ./tmp; git init');
                var hash = crypto.createHash('md5').update(`${args.tag} ${args.email}`).digest('hex');
                //post new repo to github
                request.post({
                        url: `https://${config.privToken}:x-oauth-basic@api.github.com/user/repos`,
                        headers: {
                            'User-Agent': 'winnow-code-test'
                        },
                        json: {
                            "name": `${args.tag}-${hash}`,
                            "description": "This is a codetest from winnow",
                            "private": false,
                            "has_issues": true,
                            "has_wiki": true,
                            "has_downloads": true

                        }
                    },
                    function(err, res) {
                        if (err) {
                            console.log('ooops', err);
                            rimraf.sync('tmp');
                            return callback();
                        }
                        rimraf.sync('rm tmp/.git');
                        exec('cd tmp; git init; git add .; git commit -m \'init\'');
                        exec(`cd tmp; git remote add origin ${config.gitProfileUrl}/${args.tag}-${hash}.git`);
                        exec(`cd tmp; git push -u origin master`);
                        rimraf.sync('tmp');

                        db.run("INSERT INTO applicants (email, tag, url) VALUES ($email, $tag, $url)", {
                            $email: args.email,
                            $tag: args.tag,
                            $url: `${config.gitProfileUrl}/${args.tag}-${hash}`
                        }, function(err) {
                            if (err) {
                                console.log(error);
                                return callback();
                            }
                            console.log('success');
                            return callback();
                        });
                    });
            })
            .catch(function(err) {
                console.log('there was an oops, regrettable', err);
                rimraf.sync('tmp');
                return callback();
            });
    });

vorpal
    .command('list', 'lists emails and tags')
    .action(function(args, callback) {
        db.all('SELECT * FROM applicants', function(err, rows) {
            if (err) {
                console.log(err);
                return callback();
            }
            rows.forEach(function(row) {
                console.log(`${row.tag}: ${row.email} @ ${row.url}`);
            })
            return callback();
        })
    });
vorpal
    .command('clean:tmp', 'removes tmp dir')
    .action(function(args, callback) {
        rimraf.sync('tmp');
        return callback();
    });
vorpal
    .command('clean:db', 'clean db')
    .action(function(args, callback) {
        rimraf.sync('winnow.data');
        return callback();
    });
vorpal
    .command('check <tag>', 'checks pr against branch, runs pr and compares results.')
    .action(function(args, callback) {
        db.each(`SELECT * FROM applicants WHERE tag="${args.tag}"`, function(err, row) {
            if (err) {
                console.log(err);
            }
            rimraf.sync('tmp');
            Git.Clone(row.url, "./tmp").then(function() {
                // here is where we run the tests
                var html = fs.readFileSync(`${__dirname}/tmp/${config.indexPath}`, 'utf8');

                // debug
                // var virtualConsole = jsdom.createVirtualConsole();
                // virtualConsole.on("log", function(message) {
                //     console.log("console.log called ->", message);
                // });

                jsdom.env({
                    file: `${__dirname}/tmp/${config.indexPath}`,
                    scripts: config.scripts,
                    // debug
                    // virtualConsole: virtualConsole,
                    created: function(error, window) {
                        if (error) {
                            console.log(error);
                        }
                        window.doneTrigger = function(success, state) {
                            if (_.isEqual(success, state)) {
                                console.log('checks out');
                                rimraf.sync('tmp');
                                return callback();
                            } else {
                                console.log('they screwed somthing up');
                                rimraf.sync('tmp');
                                return callback();
                            }
                        }
                    },
                    onload: function(window) {
                        window.onload();
                    }
                });
            }).catch(function(err) {
                console.log('i regret to inform you that there has been a catastrophic oops', err);
                rimraf.sync('tmp');
            });
        })
    });
vorpal
    .delimiter('winnow$')
    .show();
