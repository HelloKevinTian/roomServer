'use strict';

module.exports = {

	//db表名
	DB_ROOM: 'cs2_room',
	DB_IDS: 'cs2_ids',

	//错误码
	CODE: {
		SUCCESS: 0,
		UNKNOWN_ERROR: 10000, //未知错误
	},

	ROOM_MAX_SPACE: 2, //房间最大人数

	ROOM_STATUS: {
		NOT_FULL: 1,
		FULL: 2
	}

};