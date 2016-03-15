'use strict';
/**
 *  protobuf协议管理器
 */
var ProtoBuf = require('protobufjs');
var logger = require('ss-logger').getLogger(__filename);
var util = require('util');
var _ = require('underscore');

// 通讯协议结构体
var protoList = {};
// 协议id列表
var protocolList = {};
// 注册协议列表
var protocolMap = {};

// 消息头
var headerMsg = {
    'length': 0,
    'protoId': 0
};
// 消息头长度
var headerLength = 8;

/**
 *  读取全部proto文件
 */
function LoadAllProtoFile() {

    // 加载proto文件
    LoadProtoFile('/proto/Property.proto', 'cs2server');
    LoadProtoFile('/proto/GameMessage.proto', 'cs2server');

    // 设置协议id列表
    setProcotolList('GAME_PROTOCOL_MSG_ID');

    // 注册协议处理结构
    RegisterMsg('GAME_PROTOCOL_MSG_ID')

};

function RegisterMsg(field) {
    if (!protoList[field]) {
        logger.error('注册协议id列表错误![ %s ]', field);
    };

    for (var i in protoList[field]) {
        if (i.indexOf('c2s') > -1) {
            // 协议名 "message_s2c_error_code" 字符串前8个字符必须是"message_"!!!!!!
            var msgName = i.substr(8);
            // logger.info("register msg: ", i, "  ", msgName);
            RegisterProtocol(i, msgName);
        }
    }
}

/**
 * 注册协议解析
 */
function RegisterProtocol(protoId, msgName) {
    if (!protoList[msgName]) {
        logger.error('Register Protocol [ %d ][ %s ] is NULL', protoId, msgName);
        return;
    };
    // 获取协议id
    protoId = protocolList[protoId];
    // 注册协议结构
    protocolMap[protoId] = msgName;
};

/**
 *  读取全部proto文件
 */
function LoadProtoFile(file, pack) {
    try {
        var root = ProtoBuf.loadProtoFile(process.cwd() + file).build(pack);
        for (var i in root) {
            if (protoList[i]) {
                continue;
            };
            protoList[i] = root[i];
        }
    } catch (e) {
        logger.error(e);
    };
};

/**
 *  设置协议id列表
 */
function setProcotolList(field) {
    if (!protoList[field]) {
        logger.error('设置协议id列表错误![ %s ]', field);
    };

    for (var i in protoList[field]) {
        protocolList[i] = protoList[field][i];
    }
};

/**
 * 消息编码
 */
function Encode(message, protoId) {
    message = message.toBuffer();
    // 生成消息头
    var head = _.clone(headerMsg);
    head.protoId = protocolList[protoId];
    head.length = message.length;
    // logger.info('head: ', head);
    var messageBuffer = new Buffer(headerLength);
    if (protocolList[protoId] != undefined) {
        // 压入消息头
        messageBuffer.writeInt32BE(head.length, 0);
        messageBuffer.writeInt32BE(head.protoId, 4);
        // 压入消息体
        messageBuffer = Buffer.concat([messageBuffer, message]);
        return messageBuffer;
    } else {
        logger.error('协议id错误[%d]', protoId);
        return undefined;
    }
};

/**
 * 消息解码
 */
function Decode(message) {

    if (!Buffer.isBuffer(message)) {
        message = new Buffer(message);
        logger.warn('message is not Buffer');
    };
    // 解析消息头
    var head = _.clone(headerMsg);
    head.length = message.readInt32BE(0);
    head.protoId = message.readInt32BE(4);

    if (message.length == (headerLength + head.length)) {
        var originBuffer = new Buffer(head.length);
        message.copy(originBuffer, 0, headerLength, message.length);

        // 解析协议体
        if (!protocolMap[head.protoId]) {
            logger.error("协议id未注册[ %d ]", head.protoId);
            return null;
        };
        // logger.debug("收到客户端请求[ %d ]", head.protoId);
        var Msg = protoList[protocolMap[head.protoId]];
        Msg = Msg.decode(originBuffer);
        Msg.headerMsg = head;
        return Msg;
    } else {
        logger.error("解析消息长度不一致 ", message.length, headerLength, head.length);
        return null;
    }
};


/**
 * 获取消息体
 */
function GetMessage(field) {
    return protoList[field];
};

/**
 * 获取数值
 */
function GetValue(key, field) {

};

/**
 * 生成消息体
 */
function NewMessage(field, obj) {
    obj = obj || {};

    return new protoList[field](obj);
};
/**
 * 导出函数列表
 */
module.exports = {
    // 读取全部proto文件
    'LoadAllProtoFile': LoadAllProtoFile,
    // 消息编码
    'Encode': Encode,
    // 消息解码
    'Decode': Decode,
    // 获取消息体
    'GetMessage': GetMessage,
    // 生成消息体
    'NewMessage': NewMessage
};