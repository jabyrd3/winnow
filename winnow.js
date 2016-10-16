'use strict';
const vorpal = require('vorpal')();
var sqlite3 = require('sqlite3')
    .verbose();
var db = new sqlite3.Database('./winnow.data');

var config = require('./config.js');
var fs = require('fs');
var googleAuth = require('google-auth-library');
var moment = require('moment');

const commands = require('./commands');
// todo: fix this hack
let foo = {
    config: config,
    args: process.argv,
    db: db,
    utils:{
        makeBody: function(to, from, subject, message) {
            var str = ['Content-Type: text/plain; charset=\'UTF-8\'\n',
            'MIME-Version: 1.0\n',
            'Content-Transfer-Encoding: 7bit\n',
            'to: ', to, '\n',
            'from: ', from, '\n',
            'subject: ', subject, '\n\n',
            message].join('');
            var encodedMail = new Buffer(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
            return encodedMail;
        },
        formatUnix: function(ts) {
            if (!ts) {
                return 'never';
            }
            return moment.unix(ts).format('MMMM Do YYYY, h:mm a');
        }
    }
};

Object.keys(commands).forEach(key=>{
    var command = commands[key];
    vorpal.command(command.command[0], command.command[1])
    .action(command.action.bind(foo));
});
// setup auth
fs.readFile('client_id.json', function(err, token) {
    if (err) {
        console.log('you need to run node gmail_auth.js first to generate tokens');
        return;
    } 
    const credentials = JSON.parse(token);
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    foo.oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    foo.oauth2Client.credentials = JSON.parse(token);
    // Check if we have previously stored a token.
    fs.readFile('.credentials/winnow_gmail_auth.json', function(err, token) {
        if (err) {
            console.log('you need to run node gmail_auth first to log into gmail');
            return;
        } 
        foo.oauth2Client.credentials = JSON.parse(token);
    });
});

db.serialize(function() {
    // quick and dirty db setup
    db.run('CREATE TABLE IF NOT EXISTS applicants (email TEXT, tag TEXT, url TEXT, apiurl TEXT, lastfail INTEGER, lastpass INTEGER); ', [], function() {});
});

vorpal
    .delimiter('winnow$')
    .show();
