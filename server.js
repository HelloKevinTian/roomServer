'use strict';
/**
 * test
 */
var net = require('net');
var domain = require('domain');
var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var Handler = require('ss-handler');
var Room = require('./lib/Room');
var proto = require('./proto/ProtoManager');
var bson = require('bson');
var BSON = new bson.BSONPure.BSON();

proto.LoadAllProtoFile();

global.UTIL = require('./common/util');

var config = require('./cfg/server');
var handle = require('./cfg/handle');

var handler = new Handler(handle.room_server);

var room = new Room();

var server = net.createServer();

//定时器监测客户端连接数量
setInterval(function() {
	server.getConnections(function(err, count) {
		if (!err) {
			logger.info("当前在线人数：" + count);
		}
	})
}, 21 * 60 * 1000);

server.listen(config[0].port, config[0].host, function() {
	logger.info('创建 tcp 服务器 host = [%s] port = [%d]', server.address().address, server.address().port);
});

server.on('connection', function(sock) {

	//--------------------加入房间----------------------------
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
	//--------------------加入房间----------------------------

	//---------------------回调中异常处理-----------------------
	var d = domain.create();
	d.on('error', function(err) {
		logger.error("catch domain exception:" + err.stack);
		//通知客户端出错
		sock.end();
	});
	d.add(sock);
	//---------------------回调中异常处理-----------------------

	new Connection(sock, d); //有客户端连入

	//---------------------socket超时处理-------------------
	sock.setTimeout(30 * 60 * 1000);
	sock.addListener("timeout", function() {
		logger.debug("socket timeout,ip:" + sock.remoteAddress + ",port:" + sock.remotePort);
		sock.emit("c_close");
	});
	//---------------------socket超时处理-------------------

	//---------------------socket event---------------------
	sock.on('error', function(e) {
		logger.error("socket unknow err :" + e);
		sock.emit("c_close");
	});

	sock.on('close', function(e) {
		logger.debug('socket close ', e, sock.destroyed);
		room.deleteMember(uid);
		room.print();
		if (!sock.destroyed) {
			sock.destroy();
		}
	});

	//新加事件，socket出错时调用 sock.emit('c_close')
	sock.on('c_close', function() {
		sock.end();
		sock.destroy();
	});
	//---------------------socket event---------------------

});

function Connection(socket, d) {
	var exBuffer = new ExBuffer().uint32Head().littleEndian();
	exBuffer.on('data', onReceivePackData);

	socket.on('data', function(data) {
		logger.info('>> 原始数据:', data.length, data.toString());
		exBuffer.put(data);
	});

	//当服务端收到完整的包时
	function onReceivePackData(buffer) {

		var args = null;
		if (config[0].use_json) {
			try {
				args = JSON.parse(buffer.toString());
			} catch (e) {
				args = buffer.toString();
			}
		} else {
			args = BSON.deserialize(buffer);
		}

		logger.info('>>>>> 收到客户端数据:', buffer.length, args);

		d.run(function() {
			handler.trigger('login', socket.remoteAddress, args, socket);
		});

	}
}

server.on('error', function(e) {
	logger.error('server error: ', e);
});


/**
 * 处理异常
 */
process.on('uncaughtException', function(err) {
	var util = require('util');
	var fs = require('fs');
	if (logger) {
		logger.error('未知异常: %s', err.stack);
	} else {
		console.error('未知异常: ' + err.stack);
	}
	var d = new Date();
	var time = util.format('%d-%d-%d-%d-%d-%d', d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
	var str = util.format('%s 未知异常: %s\n', time, err.stack);
	if (!fs.existsSync('./logs')) { //不存在就创建一个
		fs.mkdirSync('./logs', '0755')
	}
	fs.appendFile("logs/uncaughtException.log", str);
});