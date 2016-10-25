var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var readline = require('readline');
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

client.sendData = function(data) {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    var len = Buffer.byteLength(data);

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    // headBuf.writeUInt32BE(len, 0);
    headBuf.writeUInt32LE(len, 0);
    client.write(headBuf);

    var bodyBuf = new Buffer(len);
    bodyBuf.write(data);
    client.write(bodyBuf);
}

client.sendBsonData = function(buf) {
    var len = buf.length;

    //写入4个字节表示本次包长
    var headBuf = new Buffer(4);
    // headBuf.writeUInt32BE(len, 0);
    headBuf.writeUInt32LE(len, 0);
    client.write(headBuf);

    client.write(buf);
}

client.connect(config[0].port, config[0].host, function() {

    if (USE_JSON) {

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        function answer() {
            rl.question("please enter op:", function(answer) {
                var data = {
                    'op': answer,
                    'uid': '29530'
                };
                client.sendData(data);
                setTimeout(test, 3000);
            });
        }

        function test() {
            answer();
        }

        test();


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
        client.sendBsonData(buf);
    }

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