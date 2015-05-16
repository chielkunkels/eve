'use strict';

var fs = require('fs');
var Log = require('log');
var path = require('path');
var HearListener = require('./listeners/hear');
var RespondListener = require('./listeners/respond');

/**
 * Create a new robot instance
 *
 * @param {Object} config   Configuration options
 *
 * @return {Robot}   A new instance of Robot
 */
var Robot = function(config){
	this.config = config;
	this.name = this.config.name;
	this.listeners = [];
	this.logger = new Log(config.log_level || 'info');

	this.loadAdapter();
};

require('util').inherits(Robot, require('events').EventEmitter);

/**
 * Load the adapter marvin will use
 */
Robot.prototype.loadAdapter = function(){
	try {
		this.adapter = new (require('./adapters/' + this.config.adapter.type))(this);
	} catch(e){
		console.error('Failed to load adapter `%s`', this.config.adapter.type);
		process.exit(1);
	}
};

/**
 * Load a single module from given directory
 *
 * @param {String} dir   Path to the module
 */
Robot.prototype.loadModule = function(dir){
	var self = this;
	fs.stat(dir, function(err, stats){
		if (err){
			console.error('Error while loading module `%s`:', dir, err);
			return;
		}
		if (!stats.isDirectory()){
			console.error('Error while loading module `%s`:', dir, 'Not a directory');
			return;
		}

		var mod;
		try {
			mod = require(dir);
		} catch(e){
			console.error('Error while loading module `%s`:', dir, e);
		}

		if (typeof mod !== 'function'){
			console.error('Error while loading module `%s`', dir, 'It does not export a function');
		}

		mod(self);
	});
};

/**
 * Load all found modules in given directory
 *
 * @param {String} dir   Path to the modules
 */
Robot.prototype.loadModules = function(dir){
	dir = path.normalize(dir);

	var self = this;
	fs.readdir(dir, function(err, files){
		for (var i = 0; i < files.length; i++){
			self.loadModule(dir + '/' + files[i]);
		}
	});
};

/**
 * Kick off the adapter
 */
Robot.prototype.run = function(){
	this.adapter.run();

	var self = this;
	this.adapter.on('message', function(message){
		self.receive(message);
	});
};

/**
 * Listen for all messages
 *
 * @param {RegExp} regex   Determines if the callback should be executed
 * @param {Function} callback   A Function that is called with a Message instance
 */
Robot.prototype.hear = function(regex, callback){
	this.listeners.push(new HearListener(this, regex, callback));
};

/**
 * Listen for messages directed at eve
 *
 * @param {RegExp} regex   Determines if the callback should be executed
 * @param {Function} callback   A Function that is called with a Message instance
 */
Robot.prototype.respond = function(regex, callback){
	this.listeners.push(new RespondListener(this, regex, callback));
};

/**
 * Pass given message to all interested interested listeners
 *
 * @param {Message} message   The message
 */
Robot.prototype.receive = function(message){
	for (var i = 0; i < this.listeners.length; i++){
		this.listeners[i].call(message);
	}
};

module.exports = Robot;
