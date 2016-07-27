/**
 * Player
 */
var logger = require('ss-logger').getLogger(__filename);
var _ = require('underscore');

var Player = function(opts) {
	opts = opts || {};

	this.uid = opts.uid;
};

module.exports = Player;