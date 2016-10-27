'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');
var playerMgr = require('../../app/playerMgr').getInstance();

function handle(args, client) {

	var uid = args.uid;

	var player = {
		'uid': uid,
		'socket': client
	};
	var err = playerMgr.addPlayer(player);
	if (err === CONST.CODE.ALREADY_LOGIN) {
		client.sendError(CONST.CODE.ALREADY_LOGIN);
		return;
	}

	playerMgr.print();

	client.uid = uid; //加入socket

	client.isLogin = true;

	client.sendMessage({
		'op': CONST.SRV_MSG.LOGIN
	});
};

module.exports = {
	'handle': handle
};