'use strict';
var net = require('net');
var logger = require('ss-logger').getLogger(__filename);
var Room = require('./common/Room');
var ExBuffer = require('./common/ExBuffer');

var config = require('./config/server');

// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL 优先级排序
// logger.trace('trace');
// logger.debug('debug');
// logger.info('info');
// logger.warn('warn');
// logger.error('error');
// logger.fatal('fatal');

var room = new Room({
	'name': 'socket_room'
});

var server = net.createServer();

server.listen(config.server.port, config.server.host, function() {
	logger.info('#Server listening on: ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(sock) {
	logger.info('NEW CLIENT: ' + sock.remoteAddress + ':' + sock.remotePort);

	var member = {
		'uid': sock.remotePort,
		'ip': sock.remoteAddress,
		'port': sock.remotePort,
		'socket': sock
	};
	room.addMember(member);
	room.broadcast('### member 【' + sock.remotePort + '】 is online!\n');

	//------------------test--------------------
	var exBuffer = new ExBuffer().uint32Head().littleEndian();
	exBuffer.on('data', onReceiveData);

	//当服务端收到完整的包时
	function onReceiveData(buffer) {
		var receiveData = buffer.toString();
		logger.info("receive data:" + receiveData);
	}

	sock.on("data", function(data) {
		logger.debug('data: ', data, data.toString());
		exBuffer.put(data); //只要收到数据就往ExBuffer里面put
	});

	//------------------test--------------------

	// sock.on('data', function(buffer) {
	// 	buffer = buffer.toString();
	// 	var receiverUid = buffer.split('#')[0];
	// 	var message = buffer.split('#')[1] + '\n';
	// 	var success = room.sendMessage(sock.remotePort, receiverUid, message);
	// 	if (success) {
	// 		sock.write('You say to ' + receiverUid + ': ' + message + '\n');
	// 	} else {
	// 		sock.write(receiverUid + ' is not online.\n');
	// 	}
	// });

	//common error handle
	sock.on("error", function(e) {
		logger.error("socket unknow err :" + e);
		sock.emit("c_close");
	});

	sock.on("c_close", function() {
		logger.info('client socket closed');
		sock.end();
		sock.destroy();
	});

	sock.on("close", function(e) {
		if (!sock.destroyed) {
			sock.destroy();
		}
	});
});

server.on('error', function(e) {
	logger.error('server error: ', e);
});