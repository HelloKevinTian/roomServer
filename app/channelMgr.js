'use strict';
/**
 * channelMgr
 */
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var async = require('async');
var _ = require('underscore');

var playerMgr = require('./playerMgr').getInstance();

var dbTemplate = {
	_id: 0,
	list: []
};

var channelMgr = module.exports;

channelMgr.init = function() {
	mongo.db('room').collection(CONST.DB_CHANNEL).remove({}, function(err) {
		logger.info('channel数据已重置', err);
	});
}

channelMgr.getDB = function(findObj, callback) {
	mongo.db('room').collection(CONST.DB_CHANNEL).findOne(findObj, function(err, info) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, info);
		}
	});
}

channelMgr.updateDB = function(channelId, newObj, callback) {
	mongo.db('room').command({
		findAndModify: CONST.DB_CHANNEL,
		query: {
			'_id': channelId
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

channelMgr.getUserNum = function(channelId, callback) {
	channelMgr.getDB({
		'_id': channelId
	}, function(err, channel) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else if (channel && channel.list) {
			callback(null, channel.list.length);
		} else {
			callback(null, 0);
		}
	});
}

channelMgr.joinChannel = function(channelId, uid, callback) {
	mongo.db('room').command({
		findAndModify: CONST.DB_CHANNEL,
		query: {
			'_id': channelId
		},
		new: true, //返回更新后的数据
		upsert: true, //没有该条记录时会insert一条（默认是false）
		update: {
			$addToSet: {
				'list': uid
			}
		}
	}, function(err, result) { // null { value: null, ok: 1 }
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, result.value);
		}
	});
}

channelMgr.leaveChannel = function(channelId, uid, callback) {
	async.waterfall([
		function(cb) {
			channelMgr.getDB({
				'_id': channelId
			}, function(err, info) {
				cb(err, info);
			});
		},
		function(info, cb) {
			if (info && info.list) {
				var index = info.list.indexOf(uid);
				if (index > -1) {
					var newList = _.clone(info.list);
					newList.splice(index, 1);
					channelMgr.updateDB(channelId, {
						'list': newList
					}, function(err) {
						cb(err);
					});
				} else {
					cb(null);
				}
			} else {
				cb(null);
			}
		}
	], function(err) {
		callback(err);
	});
}

/**
 * msg为聊天消息结构体
 */
channelMgr.broadcast = function(channelId, msg, callback) {
	channelMgr.getDB({
		'_id': channelId
	}, function(err, channel) {
		if (err || !channel) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			for (var i = 0; i < channel.list.length; i++) {
				var uid = channel.list[i];
				var player = playerMgr.getPlayer(uid);
				if (player) {
					player.socket.sendMessage(msg);
				}
			};
			callback(null);
		}
	});
}