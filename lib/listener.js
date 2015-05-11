'use strict';

// Public: A generic listener that listens to all messages
//
// eve      - An Eve instance this listener's attached to
// regex    - A Regex that determines if the callback should be executed
// callback - A Function that is called with a Message instance
//
// Returns a new Listener instance
var Listener = function(eve, regex, callback){
	if (!(this instanceof Listener)) return new Listener(eve, regex, callback);

	this.eve = eve;
	this.regex = regex;
	this.callback = callback;
};

module.exports = Listener;
