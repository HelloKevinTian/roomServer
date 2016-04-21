/**
 * Handler
 */
var logger = require('ss-logger').getLogger(__filename);
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Handler = function(opts) {
	EventEmitter.call(this);
	opts = opts || [];

	this.handleList = {};
	this.handleDescList = {};

	for (var i = 0; i < opts.length; i++) {
		if (!opts[i].desc || !opts[i].msgid || !opts[i].path) {
			logger.error('配置错误！');
			return;
		}
	};

	for (var i = 0; i < opts.length; i++) {
		this.loadHandler(opts[i]);
	};
};

util.inherits(Handler, EventEmitter);

module.exports = Handler;

Handler.prototype.loadHandler = function(opt) {
	if (this.handleList[opt.msgid]) {
		logger.error('读取协议处理错误! 协议已存在:', opt);
		return;
	}

	var path = util.format('%s/handle/%s', process.cwd(), opt.path);
	// logger.info('path:', path);
	var handler = require(path);

	var func = null;
	if (typeof handler.handle === 'function') {
		func = handler.handle;
	}
	if (func) {
		this.on(opt.msgid, func);
		this.handleList[opt.msgid] = func;
		this.handleDescList[opt.msgid] = opt.desc;
		logger.info('协议加载成功！', opt);
	} else {
		logger.error('协议加载失败！', opt);
	}
}

Handler.prototype.trigger = function(msgid, clientip, args, client) {
	if (this.handleList[msgid]) {
		this.emit(msgid, clientip, args, client);
	} else {
		logger.error('收到未知请求', msgid, clientip, args);
	}
}