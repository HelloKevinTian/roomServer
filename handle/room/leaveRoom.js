'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(clientip, args, client) {
	var uid = client.id;
	var id = client.room;

	/**
	 * 清除房间db信息
	 * 通知房间其他人自己已离开
	 */
	async.waterfall([
		function(callback) {
			roomMgr.leaveRoom(id, uid, function(err) {
				callback(err);
			});
		},
		function(callback) {
			roomMgr.noticeOther(id, function(err) {
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
		} else {
			client.sendMessage({
				'op': CONST.SRV_MSG.LEAVE_ROOM,
				'player': uid
			});
		}
	});
};

module.exports = {
	'handle': handle
};