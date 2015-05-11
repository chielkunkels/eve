'use strict';

var Listener = require('../listener');
var Response = require('../response');

/**
 * A listener that listens to all messages
 *
 * @param {Eve} eve   The Eve instance this listener is attached to
 * @param {RegExp} regex   The regex that determines if the callback should be executed
 * @param {Function} callback   The callback to call if the listener is executed
 *
 * @return {HearListener}   A new HearListener instance
 */
var HearListener = function(eve, regex, callback){
	Listener.call(this, eve, regex, callback);
};

require('inherits')(HearListener, Listener);

/**
 * Check if this listener's callback should be executed
 *
 * @param {Message} message   The message which needs to be checked against the regex
 */
HearListener.prototype.call = function(message){
	var query = message.text.match(this.regex);
	if (!query) return;

	this.callback(new Response(this.eve, message, query));
};

module.exports = HearListener;
