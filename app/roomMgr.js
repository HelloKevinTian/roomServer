'use strict';
/**
 * roomMgr
 */
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var async = require('async');
var _ = require('underscore');

var idMgr = require('./idMgr');

var dbTemplate = {
	_id: 1, //房间编号
	status: 1, //房间状态 1未满 2满
	list: [] //房间人数列表
}

var roomMgr = module.exports;

roomMgr.getDB = function(findObj, callback) {
	mongo.db().collection(CONST.DB_ROOM).find(findObj).toArray(function(err, info) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, info);
		}
	});
}

roomMgr.insertDB = function(callback) {
	idMgr.genId('room', function(err, id) {
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			var tmpObj = _.clone(dbTemplate);
			tmpObj._id = id;
			mongo.db().collection(CONST.DB_ROOM).insert(tmpObj, function(err) {
				if (err) {
					callback(CONST.CODE.UNKNOWN_ERROR);
				} else {
					callback(null, tmpObj);
				}
			});
		}
	})
}

roomMgr.updateDB = function(id, newObj, callback) {
	mongo.db().command({
		findAndModify: CONST.DB_ROOM,
		query: {
			'_id': id
		},
		new: true, //返回更新后的数据
		upsert: true, //没有该条记录时会insert一条（默认是false）
		update: {
			$set: newObj
		}
	}, function(err, result) { // null { value: null, ok: 1 }
		if (err) {
			callback(CONST.CODE.UNKNOWN_ERROR);
		} else {
			callback(null, result.value);
		}
	});
}

roomMgr.removeDB = function(id, callback) {
	
}