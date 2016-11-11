'use strict';
/**
 *  socket断开连接处理
 */
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');
var playerMgr = require('../../app/playerMgr').getInstance();

function handle(socket, had_error) {
	if (!socket.uid) {
		return;
	}

	logger.debug('##### disconnect socket uid room: ', socket.uid, socket.room);

	if (socket.room) {
		async.waterfall([
			function(callback) {
				roomMgr.leaveRoom(socket.room, socket.uid, function(err) {
					callback(err);
				});
			},
			function(callback) {
				roomMgr.noticeOther(socket.room, socket.uid, function(err) {
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
			} else if (playerMgr.getPlayer(socket.uid)) {
				playerMgr.deletePlayer(socket.uid);
				playerMgr.print();
			}
		});
	} else if (playerMgr.getPlayer(socket.uid)) {
		playerMgr.deletePlayer(socket.uid);
		playerMgr.print();
	}

};

module.exports = {
	'handle': handle
};