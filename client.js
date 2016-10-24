var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var net = require('net');
var proto = require('./proto/ProtoManager');
var bson = require('bson');
var BSON = new bson.BSONPure.BSON();

proto.LoadAllProtoFile();

var USE_JSON = true;

var config = require('./cfg/server');

//测试客户端
var exBuffer = new ExBuffer().uint32Head().littleEndian();
var client = new net.Socket();

client.connect(config[0].port, config[0].host, function() {

    if (USE_JSON) {
        var Long = bson.BSONPure.Long;
        var data = {
            op: 'quickRoom',
            msgid: 'login',
            long: Long.fromNumber(100),
            name: 'kevin',
            id: 111,
            floa: Date.now(),
            sth: {
                a: 1
            }
        };
        sendData(client, data);
    } else {
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
        var buf = BSON.serialize(doc, false, true, false);
        sendBinaryData(client, buf);
    }

});

client.on('data', function(data) {
    // logger.info('>> 原始数据:', data.length, data.toString());
    exBuffer.put(data);
});

//当客户端收到完整的数据包时
exBuffer.on('data', function(buffer) {
    logger.info('>> 收到服务器的数据:', buffer.length, buffer.toString());
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    logger.error('Connection closed');
});

function sendData(socket, data) {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    var len = Buffer.byteLength(data);

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    // headBuf.writeUInt32BE(len, 0);
    headBuf.writeUInt32LE(len, 0);
    socket.write(headBuf);

    var bodyBuf = new Buffer(len);
    bodyBuf.write(data);
    socket.write(bodyBuf);


    // var mBuffer = Buffer.concat([headBuf, bodyBuf])
    // socket.write(mBuffer);
}

function sendBinaryData(socket, buf) {
    var len = buf.length;

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    // headBuf.writeUInt32BE(len, 0);
    headBuf.writeUInt32LE(len, 0);
    socket.write(headBuf);

    socket.write(buf);
}