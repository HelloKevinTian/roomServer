'use strict';
var net = require('net');
var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var Room = require('./common/Room');
var Handler = require('./common/Handler');
var proto = require('./proto/ProtoManager');

proto.LoadAllProtoFile();

global.UTIL = require('./common/util');

var config = require('./config/server');
var handle = require('./config/handle');

// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL 优先级排序
// logger.trace('trace');
// logger.debug('debug');
// logger.info('info');
// logger.warn('warn');
// logger.error('error');
// logger.fatal('fatal');

var handler = new Handler(handle);

var room = new Room();

var server = net.createServer();

server.listen(config.server.port, config.server.host, function() {
	logger.info('#server listening on: ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(sock) {

	var uid = sock.remoteAddress + ':' + sock.remotePort;

	logger.info('new client connected: ' + uid);

	//add member
	var member = {
		'uid': uid,
		'ip': sock.remoteAddress,
		'port': sock.remotePort,
		'socket': sock
	};
	room.addMember(member);

	room.print();

	new Connection(sock); //有客户端连入

	//common error handle
	sock.on("error", function(e) {
		logger.error("socket unknow err :" + e);
		sock.end();
		sock.destroy();
	});

	sock.on("close", function(e) {
		logger.debug('socket close ', e, sock.destroyed);
		room.deleteMember(uid);
		room.print();
		if (!sock.destroyed) {
			sock.destroy();
		}
	});

});

function Connection(socket) {
	var exBuffer = new ExBuffer().uint32Head();
	exBuffer.on('data', onReceivePackData);

	socket.on('data', function(data) {
		// logger.info('>> 原始数据:', data.length, data.toString());
		exBuffer.put(data);
	});

	//当服务端收到完整的包时
	function onReceivePackData(buffer) {
		logger.info('>>>>> 收到客户端数据:', buffer.length, buffer.toString());

		handler.trigger('login', socket.remoteAddress, buffer.toString(), socket);
	}
}

server.on('error', function(e) {
	logger.error('server error: ', e);
});