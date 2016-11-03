'use strict';
var logger = require('ss-logger').getLogger(__filename);
var async = require('async');
var _ = require('underscore');

var userMgr = require('../../app/userMgr');

function handle(args, client) {
	var uid = args.uid;

	var playerInfo = null;
	var carInfo = null;

	async.waterfall([
		function(callback) {
			userMgr.getPlayerInfo(uid, function(err, player) {
				playerInfo = player;
				callback(null);
			});
		},
		function(callback) {
			userMgr.getMaxPowerCar(uid, function(err, car) {
				carInfo = car;
				callback(null);
			});
		}
	], function(err) {
		if (err) {
			client.sendError(err);
		} else {
			client.sendMessage({
				'op': CONST.SRV_MSG.USER_INFO,
				'player': playerInfo,
				'car': carInfo
			});
		}
	});
};

module.exports = {
	'handle': handle
};