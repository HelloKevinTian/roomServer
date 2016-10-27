'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(args, client) {
	var uid = client.uid;
	var roomId = client.room;

	/**
	 * 清除房间db信息
	 * 通知房间其他人自己已离开
	 */
	async.waterfall([
		function(callback) {
			roomMgr.leaveRoom(roomId, uid, function(err) {
				callback(err);
			});
		},
		function(callback) {
			roomMgr.noticeOther(roomId, uid, function(err) {
				callback(err);
			});
		},
		function(callback) {
			client.room = null;
			callback(null);
		}
	], function(err) {
		if (err) {
			client.sendError(err);
		}
	});
};

module.exports = {
	'handle': handle
};