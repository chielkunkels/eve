#!/usr/bin/env node
'use strict';

if (process.cwd() !== __dirname) process.chdir(__dirname);

var argv = require('yargs').default('c', './config.json').argv;
var path = require('path');
var config = require(path.resolve(argv.c));

var eve = new (require('./lib/eve'))(config);

eve.on('connected', function(){
	eve.loadModules(path.resolve('modules'));
});

eve.run();
