'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(clientip, args, client) {
	roomMgr.getDB({}, function(err, info) {
		UTIL.sendData(client, {
			'msgid': 1001,
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