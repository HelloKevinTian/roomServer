'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

function handle(clientip, args, client) {
	logger.info('getTime handle', clientip, args, client.address());
};

module.exports = {
	'handle': handle
};