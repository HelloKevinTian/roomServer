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