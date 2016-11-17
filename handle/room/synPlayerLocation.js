'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(args, client) {
	var uid = client.uid;
	var roomId = client.room;

	roomMgr.noticeOtherLocation(roomId, uid, args, function(err) {
		if (err) {
			client.sendError(err);
		}
	})
};

module.exports = {
	'handle': handle
};