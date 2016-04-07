# Whiteboards are awful.

The first indication of a potential employees technical abilities shouldn't happen in front of a whiteboard in your office. It's a barbaric practice that overvalues certain types of problem-solving and denigrates other styles, often to the detriment of people who aren't traditional CS-graduate type programmers.

Also, it's insanely inefficient! Having your technical staff watching someone frantically write psuedocode in a conference room is a waste of everyone's time. I prefer to screen candidates with an untimed test, specifically written based on the needs of the organization, that an applicant can perform in an environment they're familiar with–on their own time–without artifical pressure or constraints. Nobody writes huge chunks of software on a whiteboard, so why should we expect it out of candidates?

It's all too easy to project personal bias into the tech hiring process. Winnow is small commandline utility that allows you to blindly send sample codetests and check the validity of the answers using only an applicants email address. It also keeps track of who you've sent tests to in a simple sqlite database to help manage large numbers of tests and candidates so that you pick the programmer who is actually best suited for your job.

# Installation

```
git clone https://github.com/jabyrd3/winnow
cd winnow
npm install
```

THEN:

- You'll need to edit config.js.sample. 
- You'll have to register a personal API access token with github in order to use it. Make sure to give that token permissions to modify/create/delete repos in the github UI.
- In the google api credentials dashboard you'll need to follow the wizard to get a client\_id.json file for winnow to authenticate to send mail on your behalf. copy that client\_id.json into the winnow directory.

THEN: 

```
node gmail_auth.js # follow the instructions after this command
node winnow
```

# Status
This is a super pre-alpha. Use at your own risk. I'll try to get a sample code test up in the next couple days to show how to use this with your own tests.

# Tech
Vorpal is the main driver of the current interface. Internally it uses a single-table sqlite database to keep track of your issued tests. Git integration is a mix of https calls and Nodegit, tests are run with jsdom. Obfuscation is a simple uglify-js call.

# Data
To export your data simply navigate to the winnow directory on your machine and copy out winnow.data. It's a non-encrypted sqlite database built via sqlite3.

# Usage
```
node winnow
```
The winnow command opens an interactive shell-like environment via vorpal. From there, you can send code tests, view your sent tests, and check results from individual candidates.

# Available commands
send &lt;email&gt; &lt;tag&gt; - clones a repo from config.js, removes any git data, and pushes it up to a new repo
using the credentials from config.js, sends an email to the &lt;email&gt; arg with a link to the codetest, and marks down the tag/email/github url of the testee in db.

list - lists all the testees in the db. tag: email @ https://github.com/yoururl/generated-test

check &lt;tag&gt; - downloads the target repository, obfuscates any files you want hidden from the end user, runs the users code, and fires a simple equality test (for now), against 2 objects to test if the testee solved the problem.

clean:tmp - removes the tmp directory in case something breaks. If you ever need to use this please file an issue

clean:repos - deletes all winnow repos from your github account.

clean:db - clears entire testee db. this is non-recoverable.

# Todo
- [ ] add more complicated testing capabilites.
- [ ] delete single items by tagname
- [ ] search by email
- [ ] search by tagname
- [ ] delete via regex/glob
- [x] save test results
- [ ] check all tests?
- [ ] colors
- [ ] tab complete
- [ ] package for npm
- [ ] table view
- [ ] table interactivity?
- [ ] named code tests
- [ ] multiple code tests
- [ ] fancier config?
- [ ] interactive setup
- [ ] interactive goog auth
- [ ] unique id, unique tagname, interactive 'choose between two tagnames' functionality
- [ ] keep user from breaking stuff too badly
- [x] manage repos to keep from cluttering up the users github profile too badly
- [ ] tag repos in github for ease of deletion
- [ ] repo status per test, ie: # of commits since init, # of active pull requests.
- [ ] check out pr instead of actual HEAD on code check
- [ ] modularize code (commands dir)
