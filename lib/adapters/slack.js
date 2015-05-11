'use strict';

var Channel = require('../channel');
var Message = require('../message');
var User = require('../user');

// Public: Slack adapter
//
// eve - An Eve instance
//
// Returns a new instance of the Slack adapter
var Slack = function(eve){
	this.eve = eve;
	this.config = eve.config;
};

// Public: Run the adapter
//
// Returns nothing
Slack.prototype.run = function(){
	var self = this;
	var slack = this.slack = new (require('slack-client'))(this.config.adapter.token);

	slack.on('open', function(){
		console.log('CONNECTED');
		self.eve.emit('connected');
	});

	slack.on('message', function(msg){
		var isDM = msg.getChannelType() === 'DM';
		var channel = new Channel(slack.getChannelGroupOrDMByID(msg.channel).name);
		var user = new User(slack.getUserByID(msg.user).name);
		var message = new Message(channel, user, (isDM ? self.eve.name + ' ' : '') + self.removeFormatting(msg.text));
		self.eve.receive(message);
	});

	slack.on('close', function(){
		console.log('CLOSE');
	});

	slack.on('error', function(err){
		console.error('ERROR', err);
	});

	slack.login();
};

// Private: Add formatting for slack-specific entities
//
// text - A String that's need formatting applied
//
// Returns the formatted string
Slack.prototype.addFormatting = function(text){
	var self = this;

	text = text.replace(/&/g, '&amp;');
	text = text.replace(/</g, '&lt;');
	text = text.replace(/>/g, '&gt;');

	text = text.replace(/([@#])([^\s:]+)/, function(m, type, label){
		if (type === '@'){
			if ([ 'everyone', 'channel', 'group' ].indexOf(label) !== -1){
				return '<!' + label + '>';
			} else {
				var user = self.slack.getUserByName(label);
				if (user){
					return '<@' + user.id + '>';
				}
			}
		} else if (type === '#'){
			var channel = self.slack.getChannelGroupOrDMByName(label);
			if (channel){
				return '<#' + channel.id + '>';
			}
		}
		return m;
	});

	return text;
};

// Private: Remove all slack-specific formatting from a string
//
// text - A String that needs to be sanitized
//
// Returns the sanitized string
Slack.prototype.removeFormatting = function(text){
	var self = this;
	text = text.replace(/<([@#!])?([^>|]+)(?:\|([^>]+))?>/g, function(m, type, link, label){
		switch (type){
			case '@':
				if (label) return label;
				var user = self.slack.getUserByID(link);
				if (user) return '@' + user.name;
				break;

			case '#':
				if (label) return label;
				var channel = self.slack.getChannelByID(link);
				if (channel) return '#' + channel.name;
				break;

			case '!':
				if ([ 'channel', 'group', 'everyone' ].indexOf(link) !== -1) return '@' + link;
				break;

			default:
				link = link.replace(/^mailto:/, '');
				if (label && link.indexOf(label) === -1) return label + ' (' + link + ')';
				else return link;
		}
	});

	text = text.replace(/&lt;/g, '<');
	text = text.replace(/&gt;/g, '>');
	text = text.replace(/&amp;/g, '&');
	return text;
};

// Public:
//
// message - A Message instance that triggered this send
// text    - A String to send to the message's channel
//
// Returns nothing
Slack.prototype.send = function(message, text){
	var channel = this.slack.getChannelGroupOrDMByName(message.channel.name);
	channel.send(this.addFormatting(text));
};

// Public: Reply to given message
//
// message - A Message instance that triggered this reply
// text    - A String to send to the message's channel
//
// Returns nothing
Slack.prototype.reply = function(message, text){
	var channel = this.slack.getChannelGroupOrDMByName(message.channel.name);
	if (channel.getType() !== 'DM'){
		text = '@' + message.user.name + ': ' + text;
	}

	channel.send(this.addFormatting(text));
};

module.exports = Slack;
