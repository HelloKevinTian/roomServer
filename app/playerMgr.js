/**
 * playerMgr
 */
var logger = require('ss-logger').getLogger(__filename);

var playerMgr = function(opts) {
	opts = opts || {};

	this.playerNum = 0;
	this.playerList = {};
};

playerMgr.prototype.init = function() {
	logger.info('添加playerMgr管理器');
}

playerMgr.prototype.print = function() {
	logger.info('playerMgr玩家统计: ', Object.keys(this.playerList), this.playerNum);
}

playerMgr.prototype.getPlayerNum = function() {
	return this.playerNum;
}

playerMgr.prototype.getPlayer = function(id) {
	if (this.playerList.hasOwnProperty(id)) {
		return this.playerList[id];
	} else {
		logger.error('getPlayer: not exist');
	}
}

playerMgr.prototype.addPlayer = function(member) {
	if (!member || typeof member !== 'object') {
		logger.error('addPlayer: not a member');
		return;
	}
	if (!member.id) {
		logger.error('addPlayer: no id');
		return;
	}
	var id = member.id;
	if (!this.playerList.hasOwnProperty(id)) {
		this.playerNum++;
		this.playerList[id] = member;
	} else {
		logger.error('addPlayer: has exist');
	}
}

playerMgr.prototype.deletePlayer = function(id) {
	if (this.playerList.hasOwnProperty(id)) {
		this.playerNum--;
		delete this.playerList[id];
	} else {
		logger.error('deletePlayer: not exist');
	}
}

playerMgr.prototype.getAllPlayer = function() {
	return this.playerList;
}

playerMgr.prototype.clear = function() {
	this.playerList = {};
	this.playerNum = 0;
}

playerMgr.prototype.broadcast = function(message) {
	for (var k in this.playerList) {
		if (this.playerList[k].socket) {
			this.playerList[k].socket.sendMessage(message);
		}
	}
}


var instance = null;

function getInstance() {
	if (!instance) {
		instance = new playerMgr();
	}
	return instance;
}

module.exports = {
	'getInstance': getInstance
};