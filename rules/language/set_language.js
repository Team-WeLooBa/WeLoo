var uwapi = require('../../utils/uwapi');
var utils = require('../../utils/utils');
var redis_client = require('../../utils/redis');
var mongo = require('mongodb');

var mongoUri = process.env.MONGO_TEST_URI || process.env.MONGO_PROD_URI; //test URI will override PROD URI!


var collecions = ["language"];


var en_lang_set_ids = redis_client.en_lang_set_ids;
var cn_lang_set_ids = redis_client.cn_lang_set_ids;



module.exports = function(webot) {
	webot.set('set language', {
		description: 'Use \'language\' command to set default language for current user',
		pattern: /^(language|语言)\s*/i,
		handler: function(info) {
			var rep = "1.English, 2.中文";
			info.wait('reset_lang');
			return rep;
		}
	});

	webot.waitRule('reset_lang',function(info,next){

		var choice = Number(info.text);

		if (choice > 2 || choice < 1) {
			next();
		} else {

			var lang_set_ids_to_add = choice===1 ? en_lang_set_ids : cn_lang_set_ids;
			var lang_set_ids_to_remove = choice===1 ? cn_lang_set_ids : en_lang_set_ids;
		
			redis_client.redis.sismember(lang_set_ids_to_add, info.uid, function(err, reply) {
				if (err) {
					console.log("redis error: " + err.toString());
					next();
				} else {
					if (parseInt(reply) === 1) {
						next(null, "欢迎使用微信公众平台,输入Help获取帮助");
					} else { // change lang
						var removed = redis_client.redis.srem(lang_set_ids_to_remove, info.uid, function(err, reply) { // remove the user from chinese lang set
							if (err) {
								console.log("redis error: " + err.toString());
								next();
							} else {
								console.log("redis_client.redis.srem(lang_set_ids_to_remove, info.uid) reply: " + reply);
								redis_client.redis.sadd(lang_set_ids_to_add, info.uid, function(err, reply) {
									if (err) {
										console.log("redis error: " + err.toString());
										next();
									} else {
										console.log("redis_client.redis.sadd(lang_set_ids_to_add, info.uid) reply: " + reply);
										redis_client.redis.smembers(en_lang_set_ids, function(err, cb) {
											console.log("en_lang_set_ids: reply: " + cb.toString());
										});
										redis_client.redis.smembers(cn_lang_set_ids, function(err, cb) {
											console.log("cn_lang_set_ids: reply: " + cb.toString());
										});
										next(null, "Welcome WeLoo! use \'help\' to get more information");
									}
								});
							}
						});
						console.log("removed: " + removed);
						
					}
				}
			});

		}


		// redis_client.set(info.uid, "test1", function(err, reply) {
		// 	if (err) {
		// 		console.log("set language error: " + err);
		// 	} else {
		// 		console.log("set language reply: " + reply);
		// 	}
			
		// });
		// redis_client.sadd("abcde", "test2", function(err, reply) {
		// 	if (err) {
		// 		console.log("set language error: " + err);
		// 	} else {
		// 		console.log("set language reply: " + reply);
		// 		redis_client.get("12345", function(err, cb) {
		// 		console.log("get err:" + err);
		// 		var replyArray = cb.split(" ");
		// 		console.log("get reply:" + replyArray[replyArray.length-1].toString());
		// 				// var now = moment_timezone().tz('America/Toronto').format('MMMM Do YYYY, h:mm:ss a');

		// });
		// }
			
	});
		
		// setTimeout(function() {
			 
			
		// }, 1000);
		
        // var database = mongo.connect(mongoUri,collecions,function(err, db) {
        //     db.collection("language",function(err,collection){
        //         if(!err) {
        //             var userName = info.uid;
        //             var obj = {};
        //             obj[userName] = {
        //                 $exists:true
        //             };
        //             // info.wait("language");
        //             collection.find(obj).toArray(function(err,results){
        //                 var objText={};
        //                 var command = Number(info.text);
        //                 if(command==1){
        //                     command='EN';
        //                     webot.config.lang = "en_us";
        //                 }
        //                 else if(command==2){
        //                     command='CN';
        //                     webot.config.lang = "zh_cn";
        //                 }
        //                 objText[userName]=command;
        //                 if(results.length==0){
        //                     next(null,"咦？发生了奇怪的事情");
        //                 }
        //                 else{
        //                     collection.update(obj,objText,function(err,re){});

        //                     var reply = utils.localizedText(webot, 
        //                     {
        //                         'en_us' : 'Welcome WeLoo! use \'help\' to get more information',
        //                         'zh_cn' : '欢迎使用微信公众平台,输入Help获取帮助'
        //                     });
        //                     next(null, reply);
        //                 }
        //             });
        //         }
        //     });
        // });
// });
}