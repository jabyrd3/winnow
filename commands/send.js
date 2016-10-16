const rimraf = require('rimraf');
const Git = require('nodegit');
const exec = require('sync-exec');
const UglifyJS = require('uglify-js');
const crypto = require('crypto');
const request = require('request');
const google = require('googleapis');
const gmail = google.gmail('v1');
const fs = require('fs');

module.exports = {
    command: ['send <email> <tag>', 'create hashed branch of config, sends code test to email, tags email with name and saves all data.'],
    action: function(args, callback) {
        rimraf.sync('./tmp');
        Git.Clone(this.config.testSource, './tmp')
            .then(function() {
                rimraf.sync('tmp/.git');
                this.config.obfuscate.forEach(function(path) {
                    path = `./tmp/${path}`;
                    var obfuscate = UglifyJS.minify(path);
                    fs.writeFileSync(path, obfuscate.code, 'utf8');
                });
                exec('cd ./tmp; git init');
                var hash = crypto.createHash('md5').update(`${args.tag} ${args.email}`).digest('hex');
                //post new repo to github
                request.post({
                    url: `https://${this.config.privToken}:x-oauth-basic@api.github.com/user/repos`,
                    headers: {
                        'User-Agent': 'winnow-code-test'
                    },
                    json: {
                        'name': `${args.tag}-${hash}`,
                        'description': 'This is a codetest from winnow',
                        'private': false,
                        'has_issues': true,
                        'has_wiki': true,
                        'has_downloads': true
                    }
                },
                    function(err, res) {
                        if (err) {
                            console.log('ooops', err);
                            rimraf.sync('tmp');
                            return callback();
                        }
                        rimraf.sync('rm tmp/.git');

                        // used in email, git, and db save
                        const testurl = res.body.html_url;
                        const apiurl = res.body.url;
                        // used just in email message body
                        exec('cd tmp; git init; git add .; git commit -m \'init\'');
                        exec(`cd tmp; git remote add origin ${testurl}`);
                        exec('cd tmp; git push -u origin master');
                        rimraf.sync('tmp');

                        // ugly hack for now
                        const message = new String(this.config.message).replace('{{testurl}}', testurl);
                        const body = this.utils.makeBody(args.email, this.config.username, this.config.subject || 'winnow codetest', message);

                        // lets send some mail
                        gmail.users.messages.send({
                            auth: this.oauth2Client,
                            userId: 'me',
                            resource: { raw: body }
                        }, function(err) {
                            if (err) {
                                console.log('err: ', err);
                                rimraf.sync('tmp');
                                return callback();
                            }
                            console.log('mail sent');

                            // insert data about user into the db.
                            this.db.run('INSERT INTO applicants (email, tag, url, apiurl) VALUES ($email, $tag, $url, $apiurl)', {
                                $email: args.email,
                                $tag: args.tag,
                                $url: testurl,
                                $apiurl: apiurl
                            }, function(err) {
                                if (err) {
                                    console.log(err);
                                    return callback();
                                }
                                console.log('success');
                                return callback();
                            });
                        });
                    });
            })
            .catch(function(err) {
                console.log('there was an oops, regrettable', err);
                rimraf.sync('tmp');
                return callback();
            });
    }
};
