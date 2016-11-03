'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(args, client) {
	var uid = client.uid;
	var roomId = client.room;
	var action = args.action;

	roomMgr.noticeOtherAction(roomId, uid, action, function(err) {
		if (err) {
			client.sendError(err);
		}
	})
};

module.exports = {
	'handle': handle
};