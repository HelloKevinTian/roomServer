'use strict';
/**
 *  客户端数据安全验证
 */
var logger = require('ss-logger').getLogger(__filename);
var request = require('request');
var protoManager = require('../../proto/ProtoManager');

function handle(args, endcb, socket) {
	// logger.info('Client args: ', args);

	if (args.op !== 'login' && !socket.isLogin) {
		socket.sendError(CONST.CODE.NOT_LOGIN);
		return;
	}
	endcb(false, args);
};

module.exports = {
	'handle': handle
};