'use strict';

module.exports = {

	SERVER_IP: '192.168.20.137', //服务器外网地址
	ROOM_MAX_SPACE: 4, //房间最大人数
	SERVER_MAX_PLAYER_NUM: 500, //单进程最大玩家数量
	HEART_BEAT_SWITCH: 0, //心跳开关
	HEART_BEAT_TIME: 10000, //心跳间隔

	//db表名
	DB_ROOM: 'cs2_room',
	DB_IDS: 'cs2_ids',
	DB_PLAYER: 'cs2_player',
	DB_CAR: 'cs2_car',
	DB_SERVER_LIST: 'cs2_server_list',
	DB_CHANNEL: 'cs2_channel',
	DB_TEAM: 'cs2_team',

	//错误码
	CODE: {
		SUCCESS: 0,
		UNKNOWN_ERROR: 1000, //未知错误
		NOT_LOGIN: 1001, //尚未登录，请先登录
		ALREADY_LOGIN: 1002, //已经登录，不能重复登录
		SOCKET_DESTROYED: 1003, //socket已关闭
		ALREADY_IN_ROOM: 1004, //已在一个房间中
	},

	ROOM_STATUS: {
		NOT_FULL: 1,
		FULL: 2
	},

	SRV_MSG: {
		TIME_INFO: 's2c_time_info',
		LOGIN: 's2c_login',
		QUICK_ROOM: 's2c_quick_room',
		ROOM_CHANGE: 's2c_room_change',
		USER_INFO: 's2c_user_info',
		START_GAME: 's2c_startGame',
		READY_GAME: 's2c_readyGame',
		SYNC_PLAYER_LOCATION: 's2c_synPlayerLocation',
		SYNC_PLAYER_ACTION: 's2c_synPlayerAction',
		GET_CHAT_MSG: 's2c_getChatMessage',
		ENTER_WORLD_CHANNEL: 's2c_enterWorldChannelID',
	},

	CHAT_TYPE: {
		SYSTEM: 'system',
		WORLD: 'world',
		TEAM: 'team',
		ROOM: 'room'
	}

};