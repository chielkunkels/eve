'use strict';

var Listener = require('../listener');
var Response = require('../response');

// Public: A listener that listens to all messages
//
// eve      - An Eve instance this listener's attached to
// regex    - A Regex that determines if the callback should be executed
// callback - A Function that is called with a Message instance
//
// Returns a new HearListener instance
var HearListener = function(eve, regex, callback){
	if (!(this instanceof HearListener)) return new HearListener(eve, regex, callback);

	Listener.call(this, eve, regex, callback);
};

require('inherits')(HearListener, Listener);

// Public: Check if this listener's callback should be executed
//
// message - A Message object which needs to be checked against the regex
//
// Returns nothing
HearListener.prototype.call = function(message){
	var query = message.text.match(this.regex);
	if (!query) return;

	this.callback(new Response(this.eve, message, query));
};

module.exports = HearListener;
