'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');
var channelMgr = require('../../app/channelMgr');
var playerMgr = require('../../app/playerMgr').getInstance();

function handle(args, client) {

	if (client.isLogin) {
		return client.sendError(CONST.CODE.ALREADY_LOGIN);
	}

	client.isLogin = true;

	var uid = args.uid;

	var player = {
		'uid': uid,
		'socket': client
	};

	playerMgr.addPlayer(player);

	playerMgr.print();

	client.uid = uid; //uid加入socket

	var channelId = 0;

	channelMgr.joinChannel(channelId, uid, function(err) {
		if (err) {
			client.sendError(err);
		} else {
			client.channel = channelId;
			client.sendMessage({
				'op': CONST.SRV_MSG.LOGIN,
				'channel': channelId
			});
		}
	});

};

module.exports = {
	'handle': handle
};