'use strict';

var fs = require('fs');
var path = require('path');
var HearListener = require('./listeners/hear');
var RespondListener = require('./listeners/respond');

// Public: Create a new eve instance
//
// config - An Object with configuration options
//
// Returns a new instance of Eve
var Eve = function(config){
	if (!(this instanceof Eve)) return new Eve(config);

	this.config = config;
	this.name = this.config.name;
	this.listeners = [];

	this.loadAdapter();
};

require('inherits')(Eve, require('events').EventEmitter);

// Private: Load the adapter eve will use
//
// Returns nothing
Eve.prototype.loadAdapter = function(){
	try {
		this.adapter = new (require('./adapters/' + this.config.adapter.type))(this);
	} catch(e){
		console.error('Failed to load adapter `%s`', this.config.adapter.type);
		process.exit(1);
	}
};

// Public: Load a single modules from given directory
//
// dir - A String pointing to the module to read
//
// Returns nothing
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

// Public: Load all found modules in given directory
//
// dir - A String pointing to the directory to read
//
// Returns nothing
Eve.prototype.loadModules = function(dir){
	dir = path.normalize(dir);

	var self = this;
	fs.readdir(dir, function(err, files){
		for (var i = 0; i < files.length; i++){
			self.loadModule(dir + '/' + files[i]);
		}
	});
};

// Public: Kick off the adapter
//
// Returns nothing
Eve.prototype.run = function(){
	this.adapter.run();
};

// Public: Listen for all message
//
// regex    - A Regex that determines if the callback should be executed
// callback - A Function that is called with a Message instance
//
// Returns nothing
Eve.prototype.hear = function(regex, callback){
	this.listeners.push(new HearListener(this, regex, callback));
};

// Public: Listen for messages directed at eve
//
// regex    - A Regex that determines if the callback should be executed
// callback - A Function that is called with a Message instance
//
// Returns nothing
Eve.prototype.respond = function(regex, callback){
	this.listeners.push(new RespondListener(this, regex, callback));
};

// Public: Pass given message to all interested interested listeners
//
// message - A Message instance
//
// Returns nothing
Eve.prototype.receive = function(message){
	for (var i = 0; i < this.listeners.length; i++){
		this.listeners[i].call(message);
	}
};

module.exports = Eve;
