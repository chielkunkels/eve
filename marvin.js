#!/usr/bin/env node
'use strict';

if (process.cwd() !== __dirname) process.chdir(__dirname);

var argv = require('yargs').default('c', './config.json').argv;
var path = require('path');
var config = require(path.resolve(argv.c));

var robot = new (require('./lib/robot'))(config);

robot.on('connected', function(){
	robot.loadModules(path.resolve('modules'));
});

robot.run();
