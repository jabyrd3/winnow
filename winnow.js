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
db.serialize(function() {
    // quick and dirty db setup
    db.run("CREATE TABLE IF NOT EXISTS profiles (email text, tag TEXT, url TEXT); ", [], function(err, rows) {});
});
vorpal
    .command('send', 'create hashed branch of config, sends code test to email, tags email with name and saves all data.')
    .action(function(args, callback) {
        Git.Clone(config.testSource, "./tmp")
            .then(function(repo) {
                console.log('repo');
                console.log('repo', repo);
                rimraf.sync('tmp/.git');
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
                        exec(`cd tmp; git remote add origin https://github.com/jabyrd3/${hash}.git`);
                        exec(`cd tmp; git push -u origin master`);
                        rimraf.sync('tmp');
                        return callback();
                    });
            })
            .catch(function(err) {
                console.log('there was an oops, regrettable', err);
                rimraf.sync('tmp');
                console.log('error: ', err);
                return callback();
            });
    });

// vorpal
//     .command('list', 'lists emails and tags')
//     .action(function(args, callback) {
//         this.log('bar');
//         callback();
//     });
// vorpal
//     .command('check', 'checks pr against branch, runs pr and compares results.')
//     .action(function(args, callback) {
//         this.log('bar');
//         callback();
//     });
vorpal
    .delimiter('winnow$')
    .show();
