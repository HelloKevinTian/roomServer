'use strict';
var net = require('net');
var logger = require('ss-logger').getLogger(__filename);
var Room = require('./common/Room');

var config = require('./config/server');

// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL 优先级排序
logger.trace('trace');
logger.debug('debug');
logger.info('info');
logger.warn('warn');
logger.error('error');
logger.fatal('fatal');

var room = new Room({
	'name': 'socket_room'
});

var server = net.createServer();

server.listen(config.server.port, config.server.host, function() {
	logger.info('## Server listening on=> ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(sock) {
	logger.info('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
	// logger.info('#: ', sock.address());
	// logger.info('#: ', sock.localAddress);
	// logger.info('#: ', sock.localPort);

	var member = {
		'uid': sock.remotePort,
		'ip': sock.remoteAddress,
		'port': sock.remotePort,
		'socket': sock
	};
	room.addMember(member);
	room.broadcast('### member ' + sock.remotePort + ' is online!\n');

	sock.on('data', function(buffer) {
		buffer = buffer.toString();
		var receiverUid = buffer.split('#')[0];
		var message = buffer.split('#')[1] + '\n';
		var success = room.sendMessage(sock.remotePort, receiverUid, message);
		if (success) {
			sock.write('You say to ' + receiverUid + ': ' + message + '\n');
		} else {
			sock.write(receiverUid + ' is not online.\n');
		}
	});

	sock.on('end', function() {
		// room.deleteMember(sock.remotePort);
		// room.broadcast(sock.remotePort + " left\n");
		logger.error('socket end');
	});

	sock.on('close', function(err) {
		logger.info('CLIENT CLOSED: ' + sock.remoteAddress + ':' + sock.remotePort);
		sock.end();
		sock.destroy();
	});

	sock.on('error', function(err) {
		logger.error('socket error: ', err);
		sock.end();
		sock.destroy();
	})
});

server.on('error', function(e) {
	logger.error('server error: ', e);
});