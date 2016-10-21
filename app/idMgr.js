'use strict';
/**
 * idMgr
 */
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var async = require('async');
var _ = require('underscore');

var idMgr = module.exports;

idMgr.genId = function(name, callback) {
    mongo.db().command({
        findAndModify: CONST.DB_IDS,
        query: {
            '_id': name
        },
        new: true,
        upsert: true,
        update: {
            $inc: {
                'uuid': 1
            }
        }
    }, function(err, result) {
        if (err) {
            logger.error(err);
            callback(CONST.CODE.UNKNOWN_ERROR);
        } else {
            callback(null, result.value.uuid);
        }
    });
}