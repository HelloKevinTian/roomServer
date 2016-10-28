'use strict';
/**
 * roomMgr
 */
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var async = require('async');
var _ = require('underscore');

var idMgr = require('./idMgr');
var playerMgr = require('./playerMgr').getInstance();

var dbTemplate = {
	_id: 1, //房间编号
	status: 1, //房间状态 1未满 2满
	list: [] //房间人数列表
}

var roomMgr = module.exports;

roomMgr.init = function() {
	mongo.db('room').collection(CONST.DB_ROOM).remove({}, function(err) {
		logger.info('房间数据已重置', err);
	});
}

roomMgr.getDB = function(findObj, callback) {
	mongo.db('room').collection(CONST.DB_ROOM).findOne(findObj, function(err, info) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, info);
		}
	});
}

roomMgr.getDBList = function(findObj, callback) {
	mongo.db('room').collection(CONST.DB_ROOM).find(findObj).toArray(function(err, info) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, info);
		}
	});
}

roomMgr.insertDB = function(callback) {
	idMgr.genId('room', function(err, roomId) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			var tmpObj = _.clone(dbTemplate);
			tmpObj._id = roomId;
			mongo.db('room').collection(CONST.DB_ROOM).insert(tmpObj, function(err) {
				if (err) {
					callback(CONST.CODE.UNKNOWN_ERROR);
				} else {
					callback(null, tmpObj);
				}
			});
		}
	})
}

roomMgr.updateDB = function(roomId, newObj, callback) {
	mongo.db('room').command({
		findAndModify: CONST.DB_ROOM,
		query: {
			'_id': roomId
		},
		new: true, //返回更新后的数据
		upsert: true, //没有该条记录时会insert一条（默认是false）
		update: {
			$set: newObj
		}
	}, function(err, result) { // null { value: null, ok: 1 }
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, result.value);
		}
	});
}

roomMgr.leaveRoom = function(roomId, uid, callback) {
	async.waterfall([
		function(cb) {
			roomMgr.getDB({
				'_id': roomId
			}, function(err, info) {
				cb(err, info);
			});
		},
		function(info, cb) {
			if (info && info.list && info.list.indexOf(uid) > -1) {
				var newList = _.clone(info.list);
				newList.splice(newList.indexOf(uid), 1);
				roomMgr.updateDB(roomId, {
					'list': newList,
					'status': CONST.ROOM_STATUS.NOT_FULL
				}, function(err) {
					cb(err);
				});
			} else {
				cb(null);
			}
		}
	], function(err) {
		callback(err);
	});
}

roomMgr.noticeOther = function(roomId, myUid, callback) {
	roomMgr.getDB({
		'_id': roomId
	}, function(err, room) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			for (var i = 0; i < room.list.length; i++) {
				var uid = room.list[i];
				if (uid !== myUid) {
					var player = playerMgr.getPlayer(uid);
					if (player) {
						player.socket.sendMessage({
							'op': CONST.SRV_MSG.ROOM_CHANGE,
							'room': room
						});
					}
				}
			};
			callback(null);
		}
	});
}