var logger = require('ss-logger').getLogger(__filename);
var ExBuffer = require('ExBuffer');
var net = require('net');
var proto = require('./proto/ProtoManager');

proto.LoadAllProtoFile();

var config = require('./config/server');

//测试客户端
var exBuffer = new ExBuffer().uint32Head();
var client = new net.Socket();

client.connect(config.server.port, config.server.host, function() {

    //----------------------test------------------------
    // var data = 'hello I am client';
    // var len = Buffer.byteLength(data);

    // //写入4个字节表示本次包长
    // var headBuf = new Buffer(4);
    // headBuf.writeUInt32BE(len, 0);
    // client.write(headBuf);

    // var bodyBuf = new Buffer(len);
    // bodyBuf.write(data);
    // client.write(bodyBuf);
    //----------------------test------------------------

    var head = {
        'token': '123',
        'cuid': 3,
        'version': '1.0.4',
        'channel': '',
        'flowid': 2,
        'restart': 1
    };
    var protoData = proto.NewMessage('c2s_get_time', {
        'head': head
    });
    var msg = proto.Encode(protoData, 'message_c2s_get_time');
    client.write(msg);

});

client.on('data', function(data) {
    logger.info('data:', data.toString());
    exBuffer.put(data); //只要收到数据就往ExBuffer里面put
});

//当客户端收到完整的数据包时
exBuffer.on('data', function(buffer) {
    logger.info('>> client receive data,length:' + buffer.length);
    logger.info(buffer.toString());
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    logger.error('Connection closed');
});