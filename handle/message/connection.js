'use strict';
/**
 *  socket连接处理
 */
var logger = require('ss-logger').getLogger(__filename);

function handle(socket, id) {
	logger.info('new client connected: ' + id);

	var member = {
		'id': id,
		'ip': socket.remoteAddress,
		'port': socket.remotePort,
		'socketet': socket
	};
	worldMgr.addMember(member);

	worldMgr.print();
};

module.exports = {
	'handle': handle
};