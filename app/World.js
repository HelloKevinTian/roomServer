/**
 * World
 */
var logger = require('ss-logger').getLogger(__filename);
var _ = require('underscore');

var World = function(opts) {
	opts = opts || {};

	this.memberAmount = 0;
	this.memberList = {};
};

module.exports = World;

World.prototype.print = function() {
	logger.info('World: ', _.keys(this.memberList), this.memberAmount);
}

World.prototype.getMemberAmount = function() {
	return this.memberAmount;
}

World.prototype.getMember = function(id) {
	if (this.memberList.hasOwnProperty(id)) {
		return this.memberList[id];
	} else {
		logger.error('getMember: not exist');
	}
}

World.prototype.addMember = function(member) {
	if (!member || typeof member !== 'object') {
		logger.error('addMember: not a member');
		return;
	}
	if (!member.id) {
		logger.error('addMember: no id');
		return;
	}
	var id = member.id;
	if (!this.memberList.hasOwnProperty(id)) {
		this.memberAmount++;
		this.memberList[id] = member;
	} else {
		logger.error('addMember: has exist');
	}
}

World.prototype.deleteMember = function(id) {
	if (this.memberList.hasOwnProperty(id)) {
		this.memberAmount--;
		delete this.memberList[id];
	} else {
		logger.error('deleteMember: not exist');
	}
}

World.prototype.getAllMember = function() {
	return this.memberList;
}

World.prototype.clearWorld = function() {
	this.memberList = {};
	this.memberAmount = 0;
}

World.prototype.broadcast = function(message) {
	for (var k in this.memberList) {
		if (this.memberList[k].socket) {
			this.memberList[k].socket.write(message);
		}
	}
}

World.prototype.sendMessage = function(senderUid, receiverUid, message) {
	if (!senderUid || !receiverUid || !message) {
		logger.error('sendMessage fail');
		return;
	}
	message = senderUid + ' say to you: ' + message;
	if (this.memberList.hasOwnProperty(receiverUid)) {
		this.memberList[receiverUid].socket.write(message);
		return true;
	}
}