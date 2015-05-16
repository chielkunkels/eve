'use strict';

/**
 * A generic listener that listens to all messages
 *
 * @param {Robot} robot   The Robot instance this listener is attached to
 * @param {RegExp} regex   Regex that determines if the callback should be executed
 * @param {Function} callback   Function that is called with a Message instance
 *
 * @return {Listener}   A new Listener instance
 */
var Listener = function(robot, regex, callback){
	this.robot = robot;
	this.regex = regex;
	this.callback = callback;
};

module.exports = Listener;
