'use strict';
/**
 *  socket连接处理
 */
var logger = require('ss-logger').getLogger(__filename);

function handle(socket) {
	logger.info('new client connected: ', socket.remoteAddress, socket.remotePort);
};

module.exports = {
	'handle': handle
};