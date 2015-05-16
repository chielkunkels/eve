'use strict';

module.exports = function(robot){
	robot.respond(/^ping$/, function(res){
		res.reply('pong');
	});
};
