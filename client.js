var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var net = require('net');
var proto = require('./proto/ProtoManager');
var bson = require('bson');
var BSON = new bson.BSONPure.BSON();

proto.LoadAllProtoFile();

var config = require('./config/server');

//测试客户端
var exBuffer = new ExBuffer().uint32Head();
var client = new net.Socket();

client.connect(config.server.port, config.server.host, function() {

    //for string
    // var Long = bson.BSONPure.Long;
    // var data = {
    //     msgid: 'login',
    //     long: Long.fromNumber(100),
    //     name: 'kevin',
    //     id: 111,
    //     floa: Date.now(),
    //     sth: {
    //         a: 1
    //     }
    // };
    // sendData(client, JSON.stringify(data));
    // sendData(client, '123abc#$%');

    //-------------send bson binary----------------
    var Long = bson.BSONPure.Long;

    var doc = {
        msgid: 'login',
        long: Long.fromNumber(100),
        name: 'kevin',
        id: 111,
        floa: Date.now(),
        sth: {
            a: 1
        }
    };
    var buf = BSON.serialize(doc, false, true, false)
    sendBinaryData(client, buf);
    //-------------send bson binary----------------

});

client.on('data', function(data) {
    // logger.info('>> 原始数据:', data.length, data.toString());
    exBuffer.put(data);
});

//当客户端收到完整的数据包时
exBuffer.on('data', function(buffer) {
    logger.info('>> 处理数据:', buffer.length, buffer.toString());
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    logger.error('Connection closed');
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

function sendBinaryData(socket, buf) {
    var len = buf.length;

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    headBuf.writeUInt32BE(len, 0);
    socket.write(headBuf);

    socket.write(buf);
}