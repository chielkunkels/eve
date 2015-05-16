'use strict';

/**
 * Create a new response object
 *
 * @param {Robot} robot   An Robot instance this response belongs to
 * @param {Message} message   The message that triggered this response
 * @param {Array} query   Regex matches for the message
 *
 * @return {Response}   new Response instance
 */
var Response = function(robot, message, query){
	this.robot = robot;
	this.message = message;
	this.query = query;
};

/**
 * Send a response to the channel this message originated from
 *
 * @param {String} text   The text to send to the channel
 */
Response.prototype.send = function(text){
	this.robot.adapter.send(this.message, text);
};

/**
 * Send a response to the channel this message originated from to a specific user
 *
 * @param {String} text   The text to send to the channel
 */
Response.prototype.reply = function(text){
	this.robot.adapter.reply(this.message, text);
};

/**
 * Send a message to a channel or user by name
 *
 * @param {String} channelName   The channel to send a message to
 * @param {String} text   The text to send to the channel
 */
Response.prototype.dm = function(channelName, text){
	this.robot.adapter.dm(channelName, text);
};

module.exports = Response;
