'use strict';

// Public: Create a new response object
//
// eve     - An Eve instance this response belongs to
// message - A Message instance that triggered this response
// query   - An Array containing regex matches for the message
//
// Returns a new Response instance
var Response = function(eve, message, query){
	if (!(this instanceof Response)) return new Response();

	this.eve = eve;
	this.message = message;
	this.query = query;
};

// Public: Send a response to the channel this message originated from
//
// text - A String to send to the channel
//
// Returns nothing
Response.prototype.send = function(text){
	this.eve.adapter.send(this.message, text);
};

// Public: Send a response to the channel this message originated from to a specific user
//
// text - A String to send to the channel
//
// Returns nothing
Response.prototype.reply = function(text){
	this.eve.adapter.reply(this.message, text);
};

module.exports = Response;
