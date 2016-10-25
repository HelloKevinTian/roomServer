'use strict';
/**
 * userMgr
 */
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var async = require('async');
var _ = require('underscore');

var userMgr = module.exports;

userMgr.getPlayerInfo = function(uid, callback) {
	mongo.db().collection(CONST.DB_PLAYER).findOne({
		'_id': uid
	}, {
		'create_time': 0
	}, function(err, player) {
		if (err || !player) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, player);
		}
	});
}

/**
 * 取战力最大的车
 */
userMgr.getMaxPowerCar = function(uid, callback) {
	mongo.db().collection(CONST.DB_CAR).find({
		'uid': uid
	}, {
		'_id': 0
	}).sort({
		'power': -1
	}).limit(1).toArray(function(err, arr) {
		if (err) {
			logger.error(err);
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, arr[0]);
		}
	});
}