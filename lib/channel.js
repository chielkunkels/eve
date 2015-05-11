'use strict';

/**
 * Create a new Channel
 *
 * @param {String} name   The name of the channel
 *
 * @return {Channel}   A new Channel instance
 */
var Channel = function(name){
	this.name = name;
};

module.exports = Channel;
