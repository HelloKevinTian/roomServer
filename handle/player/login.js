'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(clientip, args, client) {
	roomMgr.getDB({}, function(err, info) {
		client.sendMessage(client, {
			'op': CONST.SRV_MSG.LOGIN,
			'msg': 'login success',
			'time': Date.now(),
			'error': err,
			'result': info
		});
	});

};

module.exports = {
	'handle': handle
};