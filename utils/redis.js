
var redis = null;

if (!redis) {
	console.log("redis initialized");
	if (process.env.REDISTOGO_URL) {
	    var rtg   = require("url").parse(redistogo_url);
		var redis = require("redis").createClient(rtg.port, rtg.hostname);
		redis.auth(rtg.auth.split(":")[1], function() {
			console.log("Redis client connected");
		});
	} else {
	    var redis = require("redis").createClient();
	}
	redis_initialized = true;
	redis.on("ready", function() {
		console.log("ready to send commends.");
	});

	redis.on("error", function (err) {
	 	console.log("something wrong with redis: ");
	 	console.log(err);
	});
}

exports.redis = redis;

var en_lang_set_ids = 'en_lang';
var cn_lang_set_ids = 'cn_lang';

exports.en_lang_set_ids = en_lang_set_ids;
exports.cn_lang_set_ids = cn_lang_set_ids;

