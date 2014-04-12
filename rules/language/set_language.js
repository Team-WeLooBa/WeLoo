var uwapi = require('../../utils/uwapi');
var utils = require('../../utils/utils');

var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL||
            'mongodb://y88huang:123456@oceanic.mongohq.com:10087/app23211056';
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