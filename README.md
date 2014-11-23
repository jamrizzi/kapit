# Kapit

Terminal API Tester with a focus on OAuth and JSON

[![Build Status](http://img.shields.io/travis/kelsin/kapit.svg)](https://travis-ci.org/kelsin/kapit)
[![Code Coverage](http://img.shields.io/codeclimate/coverage/github/kelsin/kapit.svg)](https://codeclimate.com/github/kelsin/kapit)
[![Code Climate](http://img.shields.io/codeclimate/github/kelsin/kapit.svg)](https://codeclimate.com/github/kelsin/kapit)
[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kelsin/kapit/blob/master/LICENSE)
[![Tips](https://img.shields.io/gratipay/kelsin.svg)](https://gratipay.com/kelsin/)

Kapit is a program that runs in your terminal and allows you to run HTTP
commands. While not nearly as full featured as [curl](http://curl.haxx.se/) or
libraries (like [request](https://github.com/request/request)) it has a few
features that I felt the other API testing programs were lacking.

### Using

This client uses [blessed](https://github.com/chjj/blessed) for the UI and
[request](https://github.com/request/request) as an HTTP node library. Other
node dependencies can be seen in our
[package.json](https://github.com/kelsin/kapit/blob/master/package.json) file.

I use [groc](https://github.com/nevir/groc) to document my code and
[mocha](http://mochajs.org/), [chai](http://chaijs.com/),
[sinon](http://sinonjs.org/), and
[istanbul](http://gotwarlost.github.io/istanbul/) to test it.

### Reasons

* I wanted a client that saved all state so I can launch it later and have all
of my inputs and outputs the same as when I left.
* I wanted to include [Paw](https://luckymarmot.com/paw)'s feature of using
parts of other requests in new requests.
* I wanted to setup a chain of requests that all build on one another.
* I wanted to include
[Webdriver](http://docs.seleniumhq.org/projects/webdriver/) support so we can
handle fancy OAuth 2.0 flows that require browser use.
* I'm not afraid of using my
[favorite editor](http://www.gnu.org/software/emacs/) to edit JSON. I'm ok
editing request bodies like this, and using this for many advanced options.
* I wanted simple options to be accessible with single key presses.

### Alternatives

* [Postman](http://www.getpostman.com/) - Chrome Extension
* [Paw](https://luckymarmot.com/paw) - Mac Desktop App
* [curl](http://curl.haxx.se/) - Command line tool

## Overview

Kapit saves all of it's data in one file that defaults to
`!/.kapit/state.json`. If you want you can have many files with kapit states by
starting kapit with a different file.

In one file you can create many chains. Chains can each hold many steps which
represent one request each.

The main window of kapit shows your current chain on the top, the current step's
request data on the left, and the response on the right.


## Usage

Here are the basic keybindings

|Key|Function|
|---|--------|
|`q`|Quit|
|`s`|Save state. *This will most like be automatic very soon|
|`?`|Display Help|
|`C`|New Chain|
|`N`|New Step|
|`D`|Delete Step|
|`Ctrl-n`|Next Step|
|`Ctrl-p`|Previous Step|
|`c`|Edit chain name|
|`n`|Edit step name|
|`t`|Edit step type|
|`tab`|Switch focus from the request to the response|
|`w`|View request/response raw JSON objects, instead of formatted text|
|`Ctrl-c`|View the context JSON blob that's available for variables *_editor_|
|`b`|Edit request body *_editor_|
|`d`|Edit request data *_editor_|
|`f`|Edit request form data *_editor_|
|`h`|Edit request header|
|`m`|Edit request method|
|`o`|Toggle request json format|
|`u`|Edit url|
|`x`|Execute current step|
|`r`|Reset current step|
|`R`|Reset all steps|

When you're focused on a window that can scroll you can use the following keys
to do so:

|Key|Function|
|---|--------|
|`j`|Down one line|
|`k`|Up one line|
|`Ctrl-d`|Down one page|
|`Ctrl-u`|Up one page|
|`g`|Go to beginning|
|`G`|Go to end|

## TODO

* I'm thinking about removing all in terminal editors and just having the main
  interface be editing the json blogs in your editor of choice. Will decide
  after more use.

## Installation

First make sure you have a recent version of [node.js](http://nodejs.org/) installed and then run:

    npm install -g kapit

You can then run with:

    kapit

Kapit will use the default config file of `~/.kapit/state.json` but you can pass
another file on the command line if you wish:

    kapit another-file.json

### Webdriver Support

If you want to use PhantomJS or Chrome Webdriver you need to install them. On Mac OSX this can be done with brew:

    brew install phantomjs
    brew install chromedriver

## Usage

## Development

Checkout and install all dependencies:

    git clone git@github.com:kelsin/kapit.git
    cd kapit
    npm install

You can then run the tests:

    npm test

Or build the documentation:

    groc
