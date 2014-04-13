var uwapi = require('../../utils/uwapi');
var utils = require('../../utils/utils');

var mongo = require('mongodb');
var mongoUri = process.env.MONGO_TEST_URI || process.env.MONGO_PROD_URI; //test URI will override PROD URI!
var collecions = ["language"];

module.exports = function(webot) {
	webot.set('set language', {
		description: 'Use \'language\' command to set default language for current user',
		pattern: /^(language|语言)\s*/i,
		handler: function(info) {
			var database = mongo.connect(mongoUri,collecions,function(err, db) {
				if(!err) {
					db.collection("language",function(err,collection) {
						var obj = {};
						obj[userName] = {$exists:true};
						collection.find(obj).toArray(function(err,results){
							if()
						})
					}
				}
			}
		}
	});
}