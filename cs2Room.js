'use strict';
/**
 * 房间服务器入口
 */
var app = require('ss-server');
var logger = require('ss-logger').getLogger(__filename);
var mongo = require('ss-mongo');
var protoManager = require('./proto/ProtoManager');
var playerMgr = require('./app/playerMgr').getInstance();

global.UTIL = require('./common/util');
global.CONST = require('./common/const');

/**
 *  修改框架配置
 */
app.configure('server', 'cfg/server.json');
app.configure('handle', 'cfg/handle.json');
app.configure('cluster', false); //tcp不能开启集群模式

/**
 * 添加mongodb读写组件
 */
mongo.configure('cfg/mongo.json');
logger.info('添加mongodb读写组件');

/**
 * 添加proto管理器
 */
app.configure('proto', function() {
	protoManager.LoadAllProtoFile();
	logger.info('添加proto管理器');
});

/**
 * 实例化玩家管理器
 */
playerMgr.init();

/**
 *  开启服务器
 */
app.start();