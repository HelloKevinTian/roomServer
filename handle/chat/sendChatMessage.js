'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var userMgr = require('../../app/userMgr');
var roomMgr = require('../../app/roomMgr');
var channelMgr = require('../../app/channelMgr');

/**
 * {"system", "world", "team", "room"}
 * 消息类型分为四种：系统消息、世界消息、组队消息、房间消息
 */
function handle(args, client) {
	var uid = client.uid;
	var chatType = args.chat_type;
	var text = args.text;

	var carInfo = null;

	async.waterfall([
		function(callback) {
			userMgr.getPlayerInfo(uid, function(err, player) {
				callback(err, player);
			});
		},
		function(player, callback) {
			var msg = {
				"op": CONST.SRV_MSG.GET_CHAT_MSG,
				"chat_type": chatType,
				"text": text,
				"uid": uid,
				"name": player.name,
				"level": player.level,
				"icon": player.icon,
				"time": Math.floor(Date.now() / 1000)
			}

			if (chatType == CONST.CHAT_TYPE.SYSTEM) {
				callback(null);
			} else if (chatType == CONST.CHAT_TYPE.WORLD) {
				channelMgr.broadcast(client.channel, msg, function(err) {
					callback(err);
				});
			} else if (chatType == CONST.CHAT_TYPE.TEAM) {

				callback(null);
			} else if (chatType == CONST.CHAT_TYPE.ROOM) {
				roomMgr.broadcast(client.room, msg, function(err) {
					callback(err);
				});
			} else {
				callback(null);
			}

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