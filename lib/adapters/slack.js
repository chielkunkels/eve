'use strict';

var Adapter = require('../adapter');
var Channel = require('../channel');
var Message = require('../message');
var User = require('../user');

/**
 * SlackAdapter
 *
 * @param {Robot} robot   An Robot instance
 *
 * @return {SlackAdapter}   A new instance of the SlackAdapter adapter
 */
var SlackAdapter = function(robot){
	this.robot = robot;
	this.config = robot.config;
};

require('util').inherits(SlackAdapter, Adapter);

/**
 * Run the adapter
 */
SlackAdapter.prototype.run = function(){
	var self = this;
	var slack = this.slack = new (require('slack-client'))(this.config.adapter.token);

	slack.on('open', function(){
		self.robot.logger.info('Slack adapter connected.');
		self.robot.emit('connected');
	});

	slack.on('message', function(msg){
		var isDM = msg.getChannelType() === 'DM';
		var channel = new Channel(slack.getChannelGroupOrDMByID(msg.channel).name);
		var user = new User(slack.getUserByID(msg.user).name);
		var message = new Message(channel, user, (isDM ? self.robot.name + ' ' : '') + self.removeFormatting(msg.text));

		self.emit('message', message);
	});

	slack.on('close', function(){
		self.robot.logger.into('Connection to slack lost');
	});

	slack.on('error', function(err){
		self.robot.logger.error('Error on slack adapter:', err);
	});

	slack.login();
};

/**
 * Add formatting for slack-specific entities
 *
 * @param {String} text   The text that needs formatting
 *
 * @return {Srring}   The formatted string
 */
SlackAdapter.prototype.addFormatting = function(text){
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

/**
 * Remove all slack-specific formatting from a string
 *
 * @param {String} text   The text that needs to be sanitized
 *
 * @return {String}   The sanitized string
 */
SlackAdapter.prototype.removeFormatting = function(text){
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

/**
 * Send given text back to the channel
 *
 * @param {Message} message   The message that triggered this send
 * @param {String} text   The text to send to the message's channel
 */
SlackAdapter.prototype.send = function(message, text){
	var channel = this.slack.getChannelGroupOrDMByName(message.channel.name);
	channel.send(this.addFormatting(text));
};

/**
 * Reply to given message
 *
 * @param {Message} message   The message that triggered this reply
 * @param {String} text   The text to send to the message's channel
 */
SlackAdapter.prototype.reply = function(message, text){
	var channel = this.slack.getChannelGroupOrDMByName(message.channel.name);
	if (channel.getType() !== 'DM'){
		text = '@' + message.user.name + ': ' + text;
	}

	channel.send(this.addFormatting(text));
};

/**
 * Send a message to a channel or user by name
 *
 * @param {String} channelName   The channel to send a message to
 * @param {String} text   The text to send to the channel
 */
SlackAdapter.prototype.dm = function(channelName, text){
	var channel = this.slack.getChannelGroupOrDMByName(channelName);
	channel.send(this.addFormatting(text));
};

module.exports = SlackAdapter;
