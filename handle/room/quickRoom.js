'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(clientip, args, client) {

	/**
	 * 查找未满房间
	 * 找到直接返回
	 * 未找到创建新房间
	 */
	async.waterfall([
		function(callback) {
			roomMgr.getDB({
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
				roomMgr.insertDB(function(err, room) {
					callback(err, room);
				});
			}
		},
		function(room, callback) {
			var newObj = {
				status: room.status
			};
			var newList = _.clone(room.list);
			newList.push(client.id);
			newObj.list = newList;
			if (newList.length >= CONST.ROOM_MAX_SPACE) {
				newObj.status = CONST.ROOM_STATUS.FULL;
			}

			roomMgr.updateDB(room._id, newObj, function(err, newRoom) {
				callback(err, newRoom);
			});
		}
	], function(err, newRoom) {
		if (err) {
			UTIL.sendError(client, err);
		} else {
			UTIL.sendData(client, newRoom);
		}
	});
};

module.exports = {
	'handle': handle
};