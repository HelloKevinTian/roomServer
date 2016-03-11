'use strict';
var net = require('net');
var logger = require('ss-logger').getLogger(__filename);
var config = require('./config/server');

var client = new net.Socket();

client.connect(config.server.port, config.server.host, function() {
	logger.info('CONNECTED TO: ' + config.server.host + ':' + config.server.port);

	client.write('I am Client!');
});

client.on('data', function(data) {
	logger.info('DATA: ' + data);
	// 完全关闭连接
	client.destroy();
});

client.on('close', function() {
	logger.info('Connection closed');
});