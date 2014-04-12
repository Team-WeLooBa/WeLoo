var commands = [/^(exam|考试)/i, /^(weather|天气)/i, /^(food|用餐)/i, /^(language|语言)/i, /^(help|帮助)/i];

exports.isEmptyObject = function (obj) {
	return !Object.keys(obj).length;
};

exports.localizedText = function (webot, keyValuePair) {
	if (webot.config.lang === 'zh_cn') {
	 	return keyValuePair.zh_cn;
	} else if (webot.config.lang === 'en_us') {
		return keyValuePair.en_us;
	} else {
		return keyValuePair.en_us; //default fallback
	}
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