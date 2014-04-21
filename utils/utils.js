var commands = [/^(exam|考试)/i, /^(weather|天气)/i, /^(food|用餐)/i, /^(language|语言)/i, /^(help|帮助)/i, /^(吃啥)/];

var redis_client = require('../utils/redis');

var en_lang_set_ids = redis_client.en_lang_set_ids;
var cn_lang_set_ids = redis_client.cn_lang_set_ids;

var commands = [/^(exam|考试)/i, /^(weather|天气)/i, /^(food|用餐)/i, /^(language|语言)/i, /^(help|帮助)/i];


exports.isEmptyObject = function (obj) {
	return !Object.keys(obj).length;
};

exports.localizedText = function (info, keyValuePair, callback) {
	var isEn = true;
	redis_client.redis.sismember(en_lang_set_ids, info.uid, function(err, reply) {
		isEn = reply;
		if (!isEn) {
		 	callback(keyValuePair.zh_cn);
		} else {
			callback(keyValuePair.en_us);
		}
	});
}

exports.sanitizeInfo = function (info) {
	info.text = info.text.trim();
	return info;
}

exports.findCommand = function (request) {
	for (var i = 0; i < commands.length; i++) {
		if (request.match(commands[i])) return true;
		else continue;
	}
	return false;
}

exports.dynamicReplyArray = ["难道你就不想试试看","奉天承运，皇帝诏曰，今天就吃","今天你必须吃","屁话少说，先来一发"
							  ,"我猜你就想吃"];