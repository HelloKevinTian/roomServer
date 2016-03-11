/**
 * Member
 */
var logger = require('ss-logger').getLogger(__filename);
var _ = require('underscore');

var Member = function(opts) {
	opts = opts || {};

	this.uid = opts.uid;
};

module.exports = Member;