module.exports = function() {


	var _initialize = function() {
		if (!redis) {
			// var redistogo_url = process.env.REDISTOGO_URL || 'redis://redistogo:727b77f96d0527b5816f929c93d6c50a@pearlfish.redistogo.com:10837';
			// fine for both Dev and Prod stage
			if (process.env.REDISTOGO_URL) {
			    var rtg   = require("url").parse(redistogo_url);
				var redis = require("redis").createClient(rtg.port, rtg.hostname);
				redis.auth(rtg.auth.split(":")[1], function() {
					console.log("Redis client connected");
				});
			} else {
			    var redis = require("redis").createClient();
			}
			console.log("redis first time initialized");
			redis.monitor(function (err, res) {
        		console.log("Entering monitoring mode.");
		    });
		    redis.on("ready", function() {
		    	console.log("ready to send commends.");
		    })
		} else {
			console.log("redis already initialized");
		}
		var util = require('util');
		// redis.on("monitor", function (time, args) {
		// 	console.log("monitored command begin:");
		//  	console.log(time + ": " + util.inspect(args));
		//  	console.log("monitored command end:");
		// });
		redis.on("error", function (err) {
		 	console.log("something wrong with redis: ");
		 	console.log(err);
		});
		return redis;
	};

	return {
		initialize: _initialize
	};
}()