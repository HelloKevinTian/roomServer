var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var net = require('net');
var util = require('./common/util');

var config = require('./cfg/server');

//测试客户端
var exBuffer = new ExBuffer().uint32Head().littleEndian();

for (var i = 1; i <= 500; i++) {
    createRobot();
};


function createRobot() {
    var client = new net.Socket();

    client.sendData = function(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        var len = Buffer.byteLength(data);

        //写入4个字节表示本次包长
        var headBuf = new Buffer(4);
        headBuf.writeUInt32LE(len, 0);
        client.write(headBuf);

        var bodyBuf = new Buffer(len);
        bodyBuf.write(data);
        client.write(bodyBuf);
    }

    client.connect(config[0].port, config[0].host, function() {
        client.sendData({
            'op': 'login',
            'uid': util.guid()
        })
    });

    client.on('data', function(data) {
        // logger.info('>> 收到原始数据:', data.length, data.toString());
        exBuffer.put(data);
    });

    exBuffer.on('data', function(buffer) {
        logger.info('>> 收到服务器的数据:', buffer.length, buffer.toString());
    });

    client.on('close', function() {
        logger.error('Connection closed');
    });
}