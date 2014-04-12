var uwapi = require('../../utils/uwapi');
var utils = require('../../utils/utils');
var moment_timezone = require('moment-timezone');

module.exports = function(webot) {
	webot.set('current weather',{
  	description:'Use \'weather\' command to get waterloo weather infomation',
  	pattern: /^(weather|天气)\s*/i,
  	handler: function(info, next){
  		info = utils.sanitizeInfo(info);

  		uwapi.getjson('weather/current', function(data) {
  			if(!utils.isEmptyObject(data)){
  				var data = data['data'];
  				var max = data['temperature_24hr_max_c'];
  				var min = data['temperature_24hr_min_c'];
  				var now = data['temperature_current_c'];
          var humidity = data['relative_humidity_percent'];
          var wind_speed = data['wind_speed_kph'];
  				var output = utils.localizedText(webot,
    				{
      				'en_us' : 'Now: '+now+'°C\tHumidity: +'+humidity+'%\nHighest: '+max+'°C\tLowest: '+min+'°C',
      				'zh_cn' : '当前气温: '+now+'°C 当前湿度: '+humidity+'%\n最高气温: '+max+'°C 最低气温: '+min+'°C'
    				});
  				var reply = {
  					title: moment_timezone().tz('America/Toronto').format('MMMM Do YYYY, h:mm:ss a'),
  					url: 'http://www.theweathernetwork.com/weather/canada/ontario/waterloo',
  					description: output
  				};
  			} else{
   				var output = utils.localizedText(webot, 
   					{
        			'en_us' : 'Something wrong... T_T',
        			'zh_cn' : '天气功能暂时不可用 T_T'
      			});
  			}
  			next(null, reply);
  		});	
  	}
  });
}