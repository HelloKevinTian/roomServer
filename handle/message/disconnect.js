'use strict';
/**
 *  socket断开连接处理
 */
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');
var playerMgr = require('../../app/playerMgr').getInstance();

function handle(socket, id, had_error) {
	logger.info('socket close ', id, had_error);

	if (socket.room) {
		async.waterfall([
			function(callback) {
				roomMgr.leaveRoom(socket.room, id, function(err) {
					callback(err);
				});
			},
			function(callback) {
				roomMgr.noticeOther(socket.room, id, function(err) {
					callback(err);
				});
			},
			function(callback) {
				socket.room = null;
				callback(null);
			}
		], function(err) {
			if (err) {
				logger.error(err);
			} else {
				playerMgr.deletePlayer(id);
				playerMgr.print();
			}
		});
	} else {
		playerMgr.deletePlayer(id);
		playerMgr.print();
	}

};

module.exports = {
	'handle': handle
};