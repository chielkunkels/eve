'use strict';

var Listener = require('../listener');
var Response = require('../response');

/**
 * A listener that listens for messages directed at eve
 *
 * @param {Eve} eve   The Eve instance this listener is attached to
 * @param {RegExp} regex   The regex that determines if the callback should be executed
 * @param {Function} callback   The callback to call if the listener is executed
 *
 * @return {RespondListener}   A new RespondListener instance
 */
var RespondListener = function(eve, regex, callback){
	Listener.call(this, eve, regex, callback);
};

require('inherits')(RespondListener, Listener);

/**
 * Check if this listener's callback should be executed
 *
 * @param {Message} message   The message which needs to be checked against the regex
 */
RespondListener.prototype.call = function(message){
	var nameRegex = new RegExp('^@?' + this.eve.name + '\:?\s*');
	if (!message.text.match(nameRegex)) return;
	var text = message.text.replace(nameRegex, '').replace(/^\s+|\s+$/, '');

	var query = text.match(this.regex);
	if (!query) return;

	this.callback(new Response(this.eve, message, query));
};

module.exports = RespondListener;
