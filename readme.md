# Whiteboards are awful.

Winnow is small commandline utility that allows you to quickly send sample codetests and check the validity of the answers using only an applicants email address. It also keeps track of who you've sent tests to in a local database to help manage large numbers of tests and candidates so that you pick the programmer who is actually best suited for your job. It's all too easy to project personal bias into the tech hiring process, so why not try to go out of your way to be more fair from the get go and get your hands on some code before making a judgement call?

## Programmers should be in charge of hiring programmers

If you automate the code testing process and make it painless for someone to track as part of their regular job, I genuinely believe it will be easier to hire a quality candidate who fits your organizations technical abilities.

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

# Writing your own tests
For your own tests to work, you need to add a couple pieces of boilerplate. You can see it in action [here](https://github.com/jabyrd3/rover). There are a couple things to keep in mind when writing a code test for rover:

- If you look at engine.js in that link, you can see the first 5 lines act as a stub to create a window object, if one doesn't exist. This is weird, but it was the only decent way for me to get a handle on the environment via jsdom.
- To get the automatic correctness checking working, you need to call `window.doneTrigger`, which is a function bolts onto the global namespace when it's running the test. Right now, the only thing this does is check that the 2 values passed are equal. If the 2 values passed to doneTrigger are equal, winnow views it as a pass, otherwise it marks down that they failed.
- Because the candidate gets a copy of the `engine.js` file, it'd be trivial to see the `successWorld` variable and work backwards to get that answer, or even hack around the test entirely. In sample.config.js, you'll notice there's an array called 'obfuscate'. This minifies any files provided to make reverse engineering the test a little bit more difficult (still not impossible, but i'd argue if if a candidate reverse engineers your code test you should probably hire them on the spot).

# Available commands

(these are under heavy development; to see better documentation just type 'help' into the winnow shell)

send &lt;email&gt; &lt;tag&gt; - clones a repo from config.js, removes any git data, and pushes it up to a new repo
using the credentials from config.js, sends an email to the &lt;email&gt; arg with a link to the codetest, and marks down the tag/email/github url of the testee in db.

list - lists all the testees in the db. tag: email @ https://github.com/yoururl/generated-test

check &lt;tag&gt; - downloads the test repo, runs the code, fires window.doneTrigger and checks for equality of end state an answer provided by the test.

check:pr &lt;tag&gt; - merges teh candidates PR into master, downloads the target repository, runs the users code, and fires a simple equality test (for now), against 2 objects to test if the testee solved the problem.

complexity &lt;tag&gt; - runs code complexity analysis (looking for cyclomatic complexity and maintainability) against the submission. This command kicks out the full output.

details:complexity &lt;tag&gt; - details about saved complexity report, formatted to be a bit nicer than the raw JSON.

clean &lt;tag&gt; - use this to remove a candidates repo (their fork persists) and record in the database

clean:tmp - removes the tmp directory in case something breaks. If you ever need to use this please file an issue

clean:repos - deletes all winnow repos from your github account, this is non-recoverable.

clean:db - clears entire testee db. this is non-recoverable.

# Todo
- [ ] add more complicated testing capabilites.
- [ ] fuzzy search list
- [ ] filter / sort list
- [ ] delete via regex/glob
- [ ] package for npm
- [ ] multiple code tests
- [ ] named code tests (ie: send jabyrd3@gmail.com <tagname> <testname>)
- [ ] fancier config?
- [ ] interactive setup
- [ ] interactive goog auth process
- [ ] repo status per test, ie: # of commits since init, # of active pull requests.
- [ ] auto run complexity after submission success
- [x] enforce unique tagname, tagname is required.
- [x] delete single items by tagname
- [x] save test results
- [x] tab complete (tags, specifically)
- [x] table view for list
- [x] keep user from breaking stuff too badly
- [x] manage repos to keep from cluttering up the users github profile too badly
- [x] tag repos in github for ease of deletion
- [x] check out pr instead of actual HEAD on code check
- [x] modularize code (commands dir)
- [x] check current master branch (don't need a PR to run test)
- [x] analyze complexity of submission
