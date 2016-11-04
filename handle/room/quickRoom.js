'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(args, client) {
	var uid = client.uid;

	/**
	 * 查找未满房间
	 * 找到直接返回
	 * 未找到创建新房间
	 * 通知房间其他人有人加入
	 */

	var dbRoom = null;
	var isRoomFull = false;

	async.waterfall([
		function(callback) {
			roomMgr.getDBList({
				status: CONST.ROOM_STATUS.NOT_FULL
			}, function(err, list) {
				callback(err, list);
			});
		},
		function(list, callback) {
			if (list.length > 0) {
				var targetRoom = UTIL.getRandomN(list, 1)[0];
				callback(null, targetRoom);
			} else {
				roomMgr.createRoom(function(err, room) {
					callback(err, room);
				});
			}
		},
		function(room, callback) {
			var newObj = {};
			newObj.status = room.status;

			var newList = _.clone(room.list);
			var userObj = {};
			userObj.uid = uid;
			for (var i = 1; i <= 4; i++) {
				if (_.findIndex(newList, {
						'pos': 1
					}) === -1) {
					userObj.pos = 1;
					break;
				}
			};
			newList.push(userObj);
			newObj.list = newList;

			if (newList.length >= CONST.ROOM_MAX_SPACE) {
				newObj.status = CONST.ROOM_STATUS.FULL;
				isRoomFull = true;
			}

			roomMgr.updateDB(room._id, newObj, function(err, newRoom) {
				if (err) {
					callback(err);
				} else {
					client.room = room._id; //房间id加入socket中
					dbRoom = newRoom;
					callback(null);
				}
			});
		},
		function(callback) {
			roomMgr.noticeOther(dbRoom._id, uid, function(err) {
				callback(err);
			});
		},
		function(callback) {
			if (isRoomFull) {
				roomMgr.noticeRoomFull(dbRoom._id, function(err) {
					callback(err);
				})
			} else {
				callback(null);
			}
		}
	], function(err) {
		if (err) {
			client.sendError(err);
		} else {
			client.sendMessage({
				'op': CONST.SRV_MSG.QUICK_ROOM,
				'room': dbRoom
			});
		}
	});
};

module.exports = {
	'handle': handle
};