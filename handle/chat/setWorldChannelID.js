'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var channelMgr = require('../../app/channelMgr');

function handle(args, client) {
	var uid = client.uid;
	var newChannelId = Number(args.channel_id);

	async.waterfall([
		function(callback) {
			if (client.channel !== newChannelId) {
				channelMgr.leaveChannel(client.channel, uid, function(err) {
					callback(err);
				});
			}
		},
		function(callback) {
			channelMgr.joinChannel(newChannelId, uid, function(err) {
				callback(err);
			});
		},
		function(callback) {
			client.channel = newChannelId;
			channelMgr.getUserNum(newChannelId, function(err, num) {
				if (err) {
					callback(err);
				} else {
					client.sendMessage({
						'op': CONST.SRV_MSG.ENTER_WORLD_CHANNEL,
						'channelID': newChannelId,
						'userNumber': num
					});
				}
			});

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