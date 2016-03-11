/**
 * Room
 */
var logger = require('ss-logger').getLogger(__filename);
var _ = require('underscore');

var Room = function(opts) {
	opts = opts || {};

	this.name = opts.name;
	this.memberAmount = 0;
	this.memberList = {};
};

module.exports = Room;

Room.prototype.print = function() {
	logger.info(this.name + ': ', this.memberList);
}

Room.prototype.getMemberAmount = function() {
	return this.memberAmount;
}

Room.prototype.getMember = function(uid) {
	if (this.memberList.hasOwnProperty(uid)) {
		return this.memberList[uid];
	} else {
		logger.error('getMember: not exist');
	}
}

Room.prototype.addMember = function(member) {
	if (!member || typeof member !== 'object') {
		logger.error('addMember: not a member');
		return;
	}
	if (!member.uid) {
		logger.error('addMember: no uid');
		return;
	}
	var uid = member.uid;
	if (!this.memberList.hasOwnProperty(uid)) {
		this.memberAmount++;
		this.memberList[uid] = member;
	} else {
		logger.error('addMember: has exist');
	}
}

Room.prototype.deleteMember = function(uid) {
	if (this.memberList.hasOwnProperty(uid)) {
		this.memberAmount--;
		delete this.memberList[uid];
	} else {
		logger.error('deleteMember: not exist');
	}
}

Room.prototype.getAllMember = function() {
	return this.memberList;
}

Room.prototype.clearRoom = function() {
	this.memberList = {};
	this.memberAmount = 0;
}

Room.prototype.broadcast = function(message) {
	for (var k in this.memberList) {
		if (this.memberList[k].socket) {
			this.memberList[k].socket.write(message);
		}
	}
}

Room.prototype.sendMessage = function(senderUid, receiverUid, message) {
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