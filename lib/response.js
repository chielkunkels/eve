'use strict';

/**
 * Create a new response object
 *
 * @param {Eve} eve   An Eve instance this response belongs to
 * @param {Message} message   The message that triggered this response
 * @param {Array} query   Regex matches for the message
 *
 * @return {Response}   new Response instance
 */
var Response = function(eve, message, query){
	this.eve = eve;
	this.message = message;
	this.query = query;
};

/**
 * Send a response to the channel this message originated from
 *
 * @param {String} text   The text to send to the channel
 */
Response.prototype.send = function(text){
	this.eve.adapter.send(this.message, text);
};

/**
 *  Send a response to the channel this message originated from to a specific user
 *
 * @param {String} text   The text to send to the channel
 */
Response.prototype.reply = function(text){
	this.eve.adapter.reply(this.message, text);
};

module.exports = Response;
