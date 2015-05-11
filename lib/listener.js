'use strict';

/**
 * A generic listener that listens to all messages
 *
 * @param {Eve} eve   The Eve instance this listener is attached to
 * @param {RegExp} regex   Regex that determines if the callback should be executed
 * @param {Function} callback   Function that is called with a Message instance
 *
 * @return {Listener}   A new Listener instance
 */
var Listener = function(eve, regex, callback){
	this.eve = eve;
	this.regex = regex;
	this.callback = callback;
};

module.exports = Listener;
