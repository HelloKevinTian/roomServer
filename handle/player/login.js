'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

function handle(clientip, args, client) {
	logger.info('login handle', clientip, args, client.address());
	UTIL.sendData(client, 'login success...');
};

module.exports = {
	'handle': handle
};