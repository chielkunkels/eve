'use strict';

module.exports = function(eve){
	eve.respond(/ping/, function(res){
		res.reply('pong');
	});
};
