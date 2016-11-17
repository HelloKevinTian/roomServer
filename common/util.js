'use strict';
/**
 * @ Author Kevin
 * @ Email  tianwen@chukong-inc.com
 * @ 2015/6/29
 * @ util通用模块
 */
var logger = require('ss-logger').getLogger(__filename);
var exec = require('child_process').exec;
var crypto = require('crypto');
var fs = require('fs');
var _ = require('underscore');
var request = require('request');

var util = module.exports;

util.getServerInfo = function() {
	var app = require('ss-server');
	var port = app.server(process.name).getPort();
	return CONST.SERVER_IP + ':' + port;
}

util.isObject = function(arg) {
	return typeof arg === 'object' && arg !== null;
};

/*
 * check string is json or not
 */
util.isJson = function(str) {
	if (JSON.stringify(str).indexOf('{') === -1) {
		return false;
	}
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

/*
 * Get the count of elements of object
 */
util.size = function(obj) {
	var count = 0;
	for (var i in obj) {
		if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
			count++;
		}
	}
	return count;
};

/**
 * 检测是否为同一天
 */
util.checkSameDay = function(time1, time2) {
	var date1 = new Date(time1);
	var date2 = new Date(time2);
	return (date1.getFullYear() === date2.getFullYear()) && (date1.getMonth() === date2.getMonth()) && (date1.getDate() === date2.getDate());
}

util.md5 = function(str) {
	var md5 = crypto.createHash('md5');
	md5.update(str, 'utf8'); //默认是binary,可选：ascii  utf8
	return md5.digest('hex'); // The encoding can be 'hex', 'binary' or 'base64'
};

util.md5File = function(file_path) {
	var fileContent = fs.readFileSync(file_path, 'utf-8');
	var buffer = new Buffer(fileContent, 'utf8'); // 扁平化buffer
	var md5 = crypto.createHash('md5');
	md5.update(buffer);
	return md5.digest('hex');
}

util.bmd5 = function(str) {
	var buffer = new Buffer(str, 'utf8');
	var md5 = crypto.createHash('md5');
	md5.update(buffer);
	return md5.digest('hex');
}

util.sha1Hash = function(salt, password) {
	return crypto.createHmac('sha1', salt + "").update(password + "").digest('hex');
};

/*
 * Date format
 */
util.formatDate = function(format, date) {
	var date = date || new Date();
	var format = format || 'yyyy/MM/dd hh:mm:ss';
	var o = {
		"M+": date.getMonth() + 1, //月
		"d+": date.getDate(), //日
		"h+": date.getHours(), //时
		"m+": date.getMinutes(), //分
		"s+": date.getSeconds(), //秒
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度
		"S": date.getMilliseconds() //毫秒
	};

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};

/*
 * get current week in a year
 */
util.getWeek = function(date) {
	var date = date || new Date();
	var firstDay = new Date(date.getFullYear(), 0, 1);
	//	delayDay ,such as 3,that means wednesday is the first day of new week
	var delayDay = 3;
	return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1 + delayDay) / 7);
};

/*
 * check if has Chinese characters.
 */
util.hasChineseChar = function(str) {
	if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
		return true;
	} else {
		return false;
	}
};

/*
 * Exeute command
 * 'ping -w 15 127.0.0.1'
 */
util.exeuteCMD = function(cmd, cb) {
	exec(cmd, function(err, stdout, stderr) {
		cb(err, stdout, stderr);
	});
}

/**
 * 生成随机字符串	eg. 93c1f974-9d3b-a412-2239-1e340aef524b
 */
util.guid = function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

/**
 * 生成随机字符串	eg. 47695b6e-9636-47f8-a1cc-8f67093e4113
 */
util.uuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * 根据权重取数组的一个随机索引
 */
util.randomByWeight = function(arr) {
	var weightArr = [];
	for (var i = 0; i < arr.length; i++) {
		if (!isNaN(Number(arr[i]))) {
			weightArr.push(Number(arr[i]));
		}
	};

	var fullWeight = 0;
	var weightLen = weightArr.length;
	for (var i = 0; i < weightLen; i++) {
		fullWeight += weightArr[i];
	};
	if (fullWeight <= 0) {
		return 0;
	}
	var randomValue = Math.random() * fullWeight;
	var accWeight = 0;
	for (var i = 0; i < weightLen; i++) {
		accWeight += weightArr[i];
		if (accWeight >= randomValue) {
			return i;
		}
	}
}

/**
 * 根据权重取数组的n个随机索引
 */
util.randomNByWeight = function(dataArr, weightArr, n) {
	var result = [];
	var weightArrClone = _.clone(weightArr);
	var dataArrClone = _.clone(dataArr);
	for (var i = 0; i < n; i++) {
		var index = util.randomByWeight(weightArrClone);
		if (dataArrClone.length > 0) {
			result.push(dataArrClone[index]);
			weightArrClone.splice(index, 1);
			dataArrClone.splice(index, 1);
		}
	};
	return result;
}

/**
 * 获取一个数组n个随机对象
 */
util.getRandomN = function(array, n) {
	var cloneArr = _.clone(array);
	var randomResult = [];
	var arrLen = cloneArr.length;
	if (arrLen <= 0 || n <= 0) {
		return randomResult;
	} else if (arrLen <= n) {
		return cloneArr;
	} else {
		for (var i = 0; i < n; i++) {
			var randomIndex = Math.round(Math.random() * (cloneArr.length - 1));
			randomResult.push(cloneArr[randomIndex]);
			cloneArr.splice(randomIndex, 1);
		};
		return randomResult;
	}
}

/**
 * "1" "1,2,3" 转换成数组 [1] [1,2,3]
 * toNumber : 是否转成Number
 */
util.strToArr = function(str, toNumber) {
	if (str.indexOf(',') > -1) {
		var strArr = str.split(',');
		if (toNumber) {
			for (var i = 0; i < strArr.length; i++) {
				strArr[i] = Number(strArr[i]);
			};
		}
		return strArr;
	} else {
		var strArr = [];
		if (toNumber) {
			strArr.push(Number(str));
		} else {
			strArr.push(str);
		}
		return strArr;
	}
}

util.random = function(min, max) {
	return min + Math.round(Math.random() * (max - min));
}

util.isValidDate = function(d) {
	if (Object.prototype.toString.call(d) === "[object Date]") {
		// it is a date
		if (isNaN(d.getTime())) { // d.valueOf() could also work
			// date is not valid
			return false;
		} else {
			// date is valid
			return true;
		}
	} else {
		// not a date
		return false;
	}
}

util.max = function(arr) {
	Array.prototype.max = function() {
		return Math.max.apply(null, this);
	};

	var max = Math.max.apply(null, arr);
	return max;
}

util.min = function(arr) {
	Array.prototype.min = function() {
		return Math.min.apply(null, this);
	};

	var min = Math.min.apply(null, arr);
	return min;
}

util.rr = function(url, form, callback) {
	request.post({
		'url': url,
		'form': form,
		'json': true
	}, function(err, result) {
		callback(err, result);
	});
}