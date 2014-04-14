var uwapi = require('../../../utils/uwapi');
var utils = require('../../../utils/utils');
var moment_timezone = require('moment-timezone');

// foodName and foodPic are corresponding to each other
var foodName = ['Tim Hortons','Bon Appétit','Browsers Café','ML’s Coffee Shop','Brubakers',
								'Williams Fresh Cafe','CEIT Café','Eye Opener Café','Liquid Assets Cafe','Subway',
								'Mudie’s','PAS Lounge','Pastry Plus','REVelation','Campus Bubble','Wasabi',
								'International News'];

var foodPic = ['https://uwaterloo.ca/food-services/sites/ca.food-services/files/tims.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/BA.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/browsers.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/mls.jpg',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/brubakers.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/williams_0.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/ceit.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/eye_opener.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/la.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/subway.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/untitled-3-01.png',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/pas.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/pastryplus.gif',
							 'https://uwaterloo.ca/food-services/sites/ca.food-services/files/revelation.gif.gif',
							 'https://pilots.uwaterloo.ca/feds/sites/ca.feds/files/commercial-services-pages-logos-cb.png',
							 'https://pilots.uwaterloo.ca/feds/sites/ca.feds/files/commercial-services-pages-logos-wasabi.png',
							 'https://pilots.uwaterloo.ca/feds/sites/ca.feds/files/commercial-services-pages-logos-in.png']

// Independent from foodName and foodPic
var foodLocation = ['Davis Centre - DC','Dana Porter Library - DP','Student Life Centre - SLC',
										'Modern Languages - ML','CEIT Building - EIT','Optometry Building - OPT',
										'Hagey Hall - HH','Environment 3 - EV3','South Campus Hall - SCH',
										'Village 1 - V1','PAS Building - PAS','B.C. Matthews Hall - BMH',
										'Needles Hall - NH','Tatham Centre - TC','Ron Eydt Village - REV'];

var matchFoodByName = function (webot, num, data) {
	var name = foodName[num-1];
	var data = data['data'];
	var food_array = new Array();
	for (var i = 0; i < data.length; i++) {
		(function(i) {
			var outlet_name = data[i]['outlet_name'].split('-');
			if (name.match(outlet_name[0].trim())) {
				var food_info = new Object();
				food_info.loc = data[i]['building'];
				food_info.latitude = data[i]['latitude'];
				food_info.longitude = data[i]['longitude'];
				var now = moment_timezone().tz('America/Toronto').format('dddd').toLowerCase();
				if (data[i]['opening_hours'][now]['is_closed'] == true) {
					reply = food_info.loc+utils.localizedText(webot, {
						'en_us' : ': Closed for Today My Friend!',
						'zh_cn' : ': 今日不开门哦亲！'
					});
				} else {
					var open = data[i]['opening_hours'][now]['opening_hour'];
					var close = data[i]['opening_hours'][now]['closing_hour'];
					var reply = food_info.loc+': '+open+' - '+close;
				}
				food_array.push(reply);
			}
		})(i);
	}
	var res = {
		title: name+'\n'+moment_timezone().tz('America/Toronto').format('dddd, MMMM Do YYYY'),
		description: food_array.join('\n'),
		pic: foodPic[num-1]
	};
	return res;
}

var matchFoodByLocation = function (webot, num, data) {
	var name = foodLocation[num-1];
	var data = data['data'];
	var food_array = new Array();
	var building = name.split('-')[1].trim();
	for (var i = 0; i < data.length; i++) {
		(function(i) {
			if (building.match(data[i]['building'])) {
				var food_info = new Object();
				food_info.name = data[i]['outlet_name'].split('-')[0];
				food_info.latitude = data[i]['latitude'];
				food_info.longitude = data[i]['longitude'];
				var now = moment_timezone().tz('America/Toronto').format('dddd').toLowerCase();
				if (data[i]['opening_hours'][now]['is_closed'] == true) {
					reply = food_info.name+utils.localizedText(webot, {
						'en_us' : ': Closed for Today My Friend!',
						'zh_cn' : ': 今日不开门哦亲！'
					});
				} else {
					var open = data[i]['opening_hours'][now]['opening_hour'];
					var close = data[i]['opening_hours'][now]['closing_hour'];
					var reply = food_info.name+': '+open+' - '+close;
				}
				food_array.push(reply);
			}
		})(i);
	}
	var res = {
		title: name+'\n'+moment_timezone().tz('America/Toronto').format('dddd, MMMM Do YYYY'),
		description: food_array.join('\n'),
	};
	return res;
}

module.exports = function(webot) {
	
	webot.set('food service search', {
		description: 'Use \'food\' command to search food services',
		pattern: /^(food|用餐)\s*$/i,
		handler: function(info) {
			info = utils.sanitizeInfo(info);
			var reply = utils.localizedText(webot, 
				{
					'en_us' : 'Please Select One Option:\n1. Search by Name\n2. Search by Location',
					'zh_cn' : '请选择查询方式:\n1. 名称查询\n2. 地点查询'
				});
			info.wait('choose');
			return reply;
		}
	});

	webot.waitRule('choose', function(info, next) {
		info = utils.sanitizeInfo(info);
		var text = Number(info.text);
		if (utils.findCommand(info.text)) {
			console.log('Next Command is: '+info.text);
      next();
		} else if (text == 1) {
			var food_list = new Array();
			var sequence;
			for (var i = 0; i < foodName.length; i++) {
				(function(i) {
					sequence = i + 1;
					food_list.push(sequence+'. '+foodName[i]);
				})(i);
			}
			var reply = {
				title: utils.localizedText(webot, 
					{
						'en_us' : 'You Hungry? It\'s Time to Eat!\nPlease Select a Number',
						'zh_cn' : '饿了么？该吃饭了我的朋友!\n请输入你想选择的号码'
					}),
				description: food_list.join('\n')
			}
			info.wait('choose_name');
			next(null, reply);
		} else if (text == 2) {
			var location_list = new Array();
			var sequence;
			for (var i = 0; i < foodLocation.length; i++) {
				(function(i) {
					sequence = i + 1;
					location_list.push(sequence+'. '+foodLocation[i]);
				})(i);
			}
			var reply = {
				title: utils.localizedText(webot, 
					{
						'en_us' : 'You Hungry? It\'s Time to Eat!\nPlease Select a Number',
						'zh_cn' : '饿了么？该吃饭了我的朋友!\n请输入你想选择的号码'
					}),
				description: location_list.join('\n')
			}
			info.wait('choose_location');
			next(null, reply);
		} else {
			var reply = utils.localizedText(webot, 
					{
						'en_us' : 'Oops! No match!\nPlease try again.',
        		'zh_cn' : '抱歉，你的查询无效！\n请重新输入。'
					});
			info.rewait();
			next(null, reply);
		}
	});

	webot.waitRule('choose_name', function(info, next) {
		info = utils.sanitizeInfo(info);
    
    if (utils.findCommand(info.text)) {
      console.log('Next Command is: '+info.text);
      next();
    } else {
    	//TODO: 如何才能减少访问API的次数，将API数据存储到Local的数据库或是上传到Database
			//TODO: 还有几个餐厅没有加进去
			var num = Number(info.text);
			var res;
			if (isNaN(num) || num > foodName.length) {
				res = utils.localizedText(webot, 
					{
						'en_us' : 'Oops! No match!\nPlease try again.',
        		'zh_cn' : '抱歉，你的查询无效！\n请重新输入。'
					});
				info.rewait();
				next(null, res);
			} else {
				uwapi.getjson('foodservices/locations', function(data) {
		 		res = matchFoodByName(webot, num, data);
		 		info.rewait();
				next(null, res);
				});
			}
    }  						
	});
	
	webot.waitRule('choose_location', function(info, next) {
		info = utils.sanitizeInfo(info);
    
    if (utils.findCommand(info.text)) {
      console.log('Next Command is: '+info.text);
      next();
    } else {
    	var num = Number(info.text);
			var res;
			if (isNaN(num) || num > foodLocation.length) {
				res = utils.localizedText(webot, 
					{
						'en_us' : 'Oops! No match!\nPlease try again.',
        		'zh_cn' : '抱歉，你的查询无效！\n请重新输入。'
					});
				info.rewait();
				next(null, res);
			} else {
				uwapi.getjson('foodservices/locations', function(data) {
		 		res = matchFoodByLocation(webot, num, data);
		  	info.rewait();
		  	next(null, res);
				});
			}
    }
	});
}