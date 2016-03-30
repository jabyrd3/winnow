# Stop sweating the tech screening process
It's too easy to project bias into the tech hiring process. Winnow is small commandline utility that allows you to blindly send sample codetests and check the validity of the applicants answer using only their email. It also keeps track of who you've sent tests to in a flat SQL file that is exportable / readable by anything that can manage sqlite.

# Installation

```
git clone https://github.com/jabyrd3/winnow
cd winnow
npm install
```

THEN:

- You'll need to edit config.js.sample. 
- You'll have to register a personal API access token with github in order to use it. Make sure to give that token permissions to modify/create repos in the github UI.
- In the google api credentials dashboard you'll need to follow the wizard to get a client\_id.json file for winnow to send auth to send mail on your behalf. copy that client\_id.json into the winnow directory

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

clean:tmp - util command removes the tmp directory in case something breaks.

clean:db - clears entire testee db. this is none recoverable.

# Todo
- add more complicated testing capabilites.
- delete single items by tagname
- search by email
- search by tagname
- delete via regex/glob
- save test results
- check all tests?
- colors
- tab complete
- package for npm
- table view
- table interactivity?
- named code tests
- multiple code tests
- fancier config?
- interactive setup
- interactive goog auth
- unique id, unique tagname, interactive 'choose between two tagname'
- keep user from breaking stuff too badly