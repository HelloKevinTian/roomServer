'use strict';
/**
 *  socket连接处理
 */
var logger = require('ss-logger').getLogger(__filename);

var playerMgr = require('../../app/playerMgr').getInstance();

function handle(socket, id) {
	logger.info('new client connected: ' + id);

	var player = {
		'id': id,
		'ip': socket.remoteAddress,
		'port': socket.remotePort,
		'socket': socket
	};
	playerMgr.addPlayer(player);

	playerMgr.print();
};

module.exports = {
	'handle': handle
};