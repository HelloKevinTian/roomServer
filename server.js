'use strict';
var net = require('net');
var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var Room = require('./common/Room');
var proto = require('./proto/ProtoManager');

proto.LoadAllProtoFile();

global.UTIL = require('./common/util');

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
	logger.info('#server listening on: ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(sock) {

	logger.info('new client connected: ' + sock.remoteAddress + ':' + sock.remotePort);

	//add member
	var member = {
		'uid': sock.remotePort,
		'ip': sock.remoteAddress,
		'port': sock.remotePort,
		'socket': sock
	};
	room.addMember(member);

	new Connection(sock); //有客户端连入

	//common error handle
	sock.on("error", function(e) {
		logger.error("socket unknow err :" + e);
		sock.end();
		sock.destroy();
	});

	sock.on("close", function(e) {
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
		exBuffer.put(data); //只要收到数据就往ExBuffer里面put
	});

	//当服务端收到完整的包时
	function onReceivePackData(buffer) {
		logger.info('>> 处理数据:', buffer.length, buffer.toString());

		sendData(socket, 'welcom, I am server');
	}
}

server.on('error', function(e) {
	logger.error('server error: ', e);
});

function sendData(socket, data) {
    var len = Buffer.byteLength(data);

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    headBuf.writeUInt32BE(len, 0);
    socket.write(headBuf);

    var bodyBuf = new Buffer(len);
    bodyBuf.write(data);
    socket.write(bodyBuf);
}