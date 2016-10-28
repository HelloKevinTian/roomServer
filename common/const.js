'use strict';

module.exports = {

	//db表名
	DB_ROOM: 'cs2_room',
	DB_IDS: 'cs2_ids',
	DB_PLAYER: 'cs2_player',
	DB_CAR: 'cs2_car',

	//错误码
	CODE: {
		SUCCESS: 0,
		UNKNOWN_ERROR: 1000, //未知错误
		NOT_LOGIN: 1001, //尚未登录，请先登录
		ALREADY_LOGIN: 1002, //已经登录，不能重复登录
	},

	ROOM_MAX_SPACE: 2, //房间最大人数

	ROOM_STATUS: {
		NOT_FULL: 1,
		FULL: 2
	},

	SRV_MSG: {
		LOGIN: 's2c_login',
		QUICK_ROOM: 's2c_quick_room',
		ROOM_CHANGE: 's2c_room_change',
		USER_INFO: 's2c_user_info',
	},

};