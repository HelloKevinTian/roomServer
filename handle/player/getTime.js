'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

function handle(args, client) {

	var nowTime = new Date();
	var todayTime = new Date(UTIL.formatDate('yyyy/MM/dd') + ' 0:0:0');
	var tomorrowTime = todayTime.getTime() + 3600 * 24 * 1000;

	var ret = {
		'now_time': Date.now(),
		'now_date': UTIL.formatDate(),
		'now_week': nowTime.getDay() === 0 ? 7 : nowTime.getDay(),
		'tomorrow_time': tomorrowTime
	};

	client.sendMessage(ret);
};

module.exports = {
	'handle': handle
};