'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var roomMgr = require('../../app/roomMgr');

function handle(clientip, args, client) {
	client.sendMessage({
		'op': CONST.SRV_MSG.LOGIN,
		'msg': 'login success',
		'time': Date.now()
	});
};

module.exports = {
	'handle': handle
};