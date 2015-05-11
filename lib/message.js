'use strict';

// Public: Create a new message
//
// channel - A Channel instance for the message's channel
// user    - A User instance for the message's user
// text    - A String with the message text
//
// Returns a new Message instance
var Message = function(channel, user, text){
	if (!(this instanceof Message)) return new Message(channel, user, text);

	this.channel = channel;
	this.user = user;
	this.text = text;
};

module.exports = Message;
