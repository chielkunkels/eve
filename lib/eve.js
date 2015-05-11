'use strict';

var fs = require('fs');
var path = require('path');
var HearListener = require('./listeners/hear');
var RespondListener = require('./listeners/respond');

/**
 * Create a new eve instance
 *
 * @param {Object} config   Configuration options
 *
 * @return {Eve}   A new instance of Eve
 */
var Eve = function(config){
	this.config = config;
	this.name = this.config.name;
	this.listeners = [];

	this.loadAdapter();
};

require('util').inherits(Eve, require('events').EventEmitter);

/**
 * Load the adapter eve will use
 */
Eve.prototype.loadAdapter = function(){
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
Eve.prototype.loadModule = function(dir){
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
Eve.prototype.loadModules = function(dir){
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
Eve.prototype.run = function(){
	this.adapter.run();
};

/**
 * Listen for all messages
 *
 * @param {RegExp} regex   Determines if the callback should be executed
 * @param {Function} callback   A Function that is called with a Message instance
 */
Eve.prototype.hear = function(regex, callback){
	this.listeners.push(new HearListener(this, regex, callback));
};

/**
 * Listen for messages directed at eve
 *
 * @param {RegExp} regex   Determines if the callback should be executed
 * @param {Function} callback   A Function that is called with a Message instance
 */
Eve.prototype.respond = function(regex, callback){
	this.listeners.push(new RespondListener(this, regex, callback));
};

/**
 * Pass given message to all interested interested listeners
 *
 * @param {Message} message   The message
 */
Eve.prototype.receive = function(message){
	for (var i = 0; i < this.listeners.length; i++){
		this.listeners[i].call(message);
	}
};

module.exports = Eve;
