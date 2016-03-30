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
db.serialize(function() {
    // quick and dirty db setup
    db.run("CREATE TABLE IF NOT EXISTS applicants (email TEXT, tag TEXT, url TEXT); ", [], function(err, rows) {});
});
vorpal
    .command('send <email> [tag]', 'create hashed branch of config, sends code test to email, tags email with name and saves all data.')
    .action(function(args, callback) {
        Git.Clone(config.testSource, "./tmp")
            .then(function(repo) {
                rimraf.sync('tmp/.git');
                config.obfuscate.forEach(function(path) {
                    var obfuscate = UglifyJS.minify(path);
                    fs.writeFileSync(path, obfuscate.code, 'utf8');
                });
                exec('cd ./tmp; git init');
                var hash = Math.random();
                //post new repo to github
                request.post({
                        url: `https://${config.privToken}:x-oauth-basic@api.github.com/user/repos`,
                        headers: {
                            'User-Agent': 'winnow-code-test'
                        },
                        json: {
                            "name": hash,
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
                        exec(`cd tmp; git remote add origin ${config.gitProfileUrl}/${hash}.git`);
                        exec(`cd tmp; git push -u origin master`);
                        rimraf.sync('tmp');

                        db.run("INSERT INTO applicants (email, tag, url) VALUES ($email, $tag, $url)", {
                            $email: args.email,
                            $tag: args.tag,
                            $url: `${config.gitProfileUrl}/${hash}`
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
    .command('check', 'checks pr against branch, runs pr and compares results.')
    .action(function(args, callback) {
        db.each('SELECT * FROM applicants WHERE tag="foo"', function(err, row) {
            if (err) {
                console.log(err);
            }
            Git.Clone(row.url, "./tmp").then(function() {
                console.log(row);
                // here is where we run the tests
                // cleanup
                // rimraf.sync('tmp');
                return callback();
            }).catch(function(err) {
                console.log('i regret to inform you that there has been a catastrophic oops', err);
                rimraf.sync('tmp');
            });
        })
    });
vorpal
    .delimiter('winnow$')
    .show();
