'use strict';

var Listener = require('../listener');
var Response = require('../response');

// Public: A listener that listens for messages directed at eve
//
// eve      - An Eve instance this listener's attached to
// regex    - A Regex that determines if the callback should be executed
// callback - A Function that is called with a Message instance
//
// Returns a new RespondListener instance
var RespondListener = function(eve, regex, callback){
	if (!(this instanceof RespondListener)) return new RespondListener(eve, regex, callback);

	Listener.call(this, eve, regex, callback);
};

require('inherits')(RespondListener, Listener);

// Public: Check if this listener's callback should be executed
//
// message - A Message object which needs to be checked against the regex
//
// Returns nothing
RespondListener.prototype.call = function(message){
	var nameRegex = new RegExp('^@?' + this.eve.name + '\:?\s*');
	if (!message.text.match(nameRegex)) return;
	var text = message.text.replace(nameRegex, '').replace(/^\s+|\s+$/, '');

	var query = text.match(this.regex);
	if (!query) return;

	this.callback(new Response(this.eve, message, query));
};

module.exports = RespondListener;
