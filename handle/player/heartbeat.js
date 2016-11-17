'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');
var playerMgr = require('../../app/playerMgr').getInstance();

var heartbeatList = {};

if (CONST.HEART_BEAT_SWITCH) {
	setInterval(function() {
		logger.info('heartbeat timer: ', Object.keys(heartbeatList));
		for (var k in heartbeatList) {
			// logger.debug('===========  ', Date.now() - heartbeatList[k] - CONST.HEART_BEAT_TIME)
			if (Date.now() - heartbeatList[k] > CONST.HEART_BEAT_TIME) {
				var player = playerMgr.getPlayer(k);
				if (player) {
					logger.warn('【heartbeat】心跳不符，移除死连接：', k, Date.now() - heartbeatList[k]);
					delete heartbeatList[k];
					player.socket.emit('c_close');
				}
			}
		}
	}, (CONST.HEART_BEAT_TIME - 3000) > 5000 ? (CONST.HEART_BEAT_TIME - 3000) : 5000);
}

function handle(args, client) {
	logger.info('heartbeat', args);

	heartbeatList[client.uid] = Date.now();
};

module.exports = {
	'handle': handle
};