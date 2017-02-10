'use strict';
/**
 *  socket断开连接处理
 */
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');
var channelMgr = require('../../app/channelMgr');
var playerMgr = require('../../app/playerMgr').getInstance();

function handle(socket, had_error) {
	if (!socket.uid) {
		return;
	}

	logger.debug('##### A socket disconnect uid room channel: ', socket.uid, socket.room, socket.channel);

	async.waterfall([
		function(callback) { //强制踢出房间
			if (socket.room) {
				roomMgr.leaveRoom(socket.room, socket.uid, function(err) {
					callback(err);
				});
			} else {
				callback(null);
			}
		},
		function(callback) { //通知其他人已离开房间
			if (socket.room) {
				roomMgr.noticeOther(socket.room, socket.uid, function(err) {
					callback(err);
				});
			} else {
				callback(null);
			}
		},
		function(callback) { //强制踢出聊天channel
			if (socket.channel || socket.channel === 0) {
				channelMgr.leaveChannel(socket.channel, socket.uid, function(err) {
					callback(err);
				});
			} else {
				callback(null);
			}
		},
		function(callback) {
			delete socket.room;
			delete socket.channel;
			callback(null);
		},
		function(callback) { //清楚在线信息
			if (playerMgr.getPlayer(socket.uid)) {
				playerMgr.deletePlayer(socket.uid);
				playerMgr.print();
			}
			callback(null);
		}
	], function(err) {
		if (err) {
			logger.error('disconnect: ', err);
		}
	});

};

module.exports = {
	'handle': handle
};