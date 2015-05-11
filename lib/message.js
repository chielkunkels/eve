'use strict';

/**
 * Create a new message
 *
 * @param {Channel} channel   The message's channel
 * @param {User} user   The message's sender
 * @param {String} text   The message text
 *
 * @return {Message}   A new Message instance
 */
var Message = function(channel, user, text){
	this.channel = channel;
	this.user = user;
	this.text = text;
};

module.exports = Message;
