'use strict';
/**
 *  socket断开连接处理
 */
var logger = require('ss-logger').getLogger(__filename);

function handle(socket, id, had_error) {
	logger.debug('socket close ', id, had_error);

	worldMgr.deleteMember(id);

	worldMgr.print();
};

module.exports = {
	'handle': handle
};