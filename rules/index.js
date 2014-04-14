//All dependencies goes here
var crypto = require('crypto');
var debug = require('debug');
var log = debug('weloo:log');
var verbose = debug('weloo:verbose');
var error = debug('weloo:error');
var _ = require('underscore')._;
var search = require('../lib/support').search;
var geo2loc = require('../lib/support').geo2loc;
var package_info = require('../package.json');
var mongo = require('mongodb');
var mongoUri = process.env.MONGO_TEST_URI || process.env.MONGO_PROD_URI; //test URI will override PROD URI!
var collecions = ["language"];

//A blocking library enable us to wait for API response
// var httpsync = require('httpsync');
var moment = require('moment');
var moment_timezone =  require('moment-timezone');

var utils = require('../utils/utils.js');

/**
 * 初始化路由规则
 */

module.exports = exports = function(webot){
  

  webot.loads('./uwaterloo/terms/exam_schedule');
  webot.loads('./weather/weather');
  webot.loads('./uwaterloo/food/food_services');
  webot.loads('./eatWhat/eat_what');
  // webot.loads('language/set_language');

  webot.set({
    description: 'Welcome page',
    pattern: function(info) {
      return info.is('event') && info.param.event === 'subscribe';
    },
    handler: function(info, next){
      var reply_cn = {
        title: '感谢关注「微卢」\n输入「Help」查看指令列表',
        pic: 'http://i.imgur.com/YWiWlYj.png?1?9930',
        url: 'http://team-welooba.github.io/WeLoo',
        description: [
          '饿了吗？来这里看看吃什么吧!',
          '要期末了吗？来这里看看在哪儿考吧!',
          '无聊了吗？来这里猜猜数字吧!\n',
          '输入「Help」查看指令列表\n',
          '平台仍在测试中，欢迎大家多提意见',
          '点击「查看全文」至GitHub源代码页'].join('\n')
      };
      var reply_en = {
        title: 'Welcome to 「WeLoo」\nEnter「Help」to Start',
        pic: 'http://i.imgur.com/YWiWlYj.png?1?9930',
        url: 'http://team-welooba.github.io/WeLoo',
        description: [
          'Hungry? We can help you!',
          'Final time? We can help you!',
          'Feel boring? We can help you!\n',
          'Enter「Help」to Start\n',
          'Click「Read All」to WeLoo GitHub Page'
        ].join('\n')
      };
      var reply = utils.localizedText(webot,
        {
          'en_us' : reply_en,
          'zh_cn' : reply_cn
        });
      next(null,reply);
    }
  });

  webot.set({
    pattern: /^(help)\s*/i,
    handler: function(info, next){
      var reply_cn = {
        title: '指令列表',
        description: [
          '你可以试试以下指令:',
          '「Lan」: 设置公众平台语言',
          '「Exam」: 查询期末考试时间与地点',
          '「Food」: 查询学校用餐地点与时间',
          '「Help」: 重新查看本指令界面',
          '「Weather」: 查询当前天气情况',
        ].join('\n')
      };
      var reply_en = {
        title: 'Command List',
        description: [
          'WeLoo Command List:',
          '「Lan」: Set Account Language',
          '「Exam」: Check Final Ecam Schedule',
          '「Food」: Food Services Open Hours',
          '「Help」: Read This Message Again',
          '「Weather」: Waterloo Current Weather'
        ].join('\n')
      };
      var reply = utils.localizedText(webot,
        {
          'en_us' : reply_en,
          'zh_cn' : reply_cn
        });
      next(null, reply);
    }
  });

//To do.
  webot.waitRule('language', function(info, next) {
    var language = Number(info.text);
    var lanInfo = '';
    if(language==1){
        lanInfo='CH';
    }
    else if(language==2){
        lanInfo='EN';
    }
    var database = mongo.connect(mongoUri,collecions,function(err, db) {
      db.collection("language",function(err,collection){
        if(!err) {
        var userName = info.uid;
        var obj = {};
        obj[userName] = lanInfo;
         collection.insert(obj,function(err,cb){});
         if(language==1){
         webot.config.lang = "zh_cn"
       }
       else if(language==2){
         webot.config.lang = "en_us"
       }
         // info.wait("language");
         var reply = utils.localizedText(webot, 
        {
          'en_us' : 'Welcome WeLoo! use \'help\' to get more information',
          'zh_cn' : '欢迎使用微信公众平台,输入Help获取帮助'
        })
         next(null, reply);
        }
      });
    });
  });


  webot.waitRule('wait_ji', function(info) {
    var text = info.text;
    if (text == '不玩了') {
      info.resolve();
      return '88~';
    }
    var url = "http://xjjapi.duapp.com/api/show.action?m=chat&msg="+info.text;
    var req = httpsync.get(url);
    var response= req.end();
    var data = response['data'].toString('utf-8');
    info.rewait();
    return data;
  });

  webot.set('little yellow chicken', {
    pattern: /小黄鸡/,
    handler: function(info) {
      info.wait('wait_ji');
      return '我已变身鸡器人！';
    }
  }

  );

  // 定义一个 wait rule
  webot.waitRule('wait_guess', function(info) {
    var r = Number(info.text);

    // 用户不想玩了...
    if (isNaN(r)) {
      info.resolve();
      return null;
    }

    var num = info.session.guess_answer;

    if (r === num) {
      return '你真聪明!';
    }

    var rewaitCount = info.session.rewait_count || 0;
    if (rewaitCount >= 2) {
      return '怎么这样都猜不出来！答案是 ' + num + ' 啊！';
    }

    //重试
    info.rewait();
    return (r > num ? '大了': '小了') +',还有' + (2 - rewaitCount) + '次机会,再猜.';
  });

  webot.set('guess number', {
    description: '发送: game , 玩玩猜数字的游戏吧',
    pattern: /(?:game|玩?游戏)\s*(\d*)/,
    handler: function(info){
      //等待下一次回复
      var num = Number(info.param[1]) || _.random(1,9);

      verbose('answer is: ' + num);

      info.session.guess_answer = num;

      info.wait('wait_guess');
      return '玩玩猜数字的游戏吧, 1~9,选一个';
    }
  });
  

//   webot.set('set language',{
//     description: '发送: 重新设置语言',
//     pattern: /^(l|L)anguage/,
//     handler: function(info){
//       var rep = "1.English, 2.中文";
//       info.wait('reset_lang');
//       return rep;
//     }
//   });


// webot.waitRule('reset_lang',function(info,next){
//         var database = mongo.connect(mongoUri,collecions,function(err, db) {
//             db.collection("language",function(err,collection){
//                 if(!err) {
//                     var userName = info.uid;
//                     var obj = {};
//                     obj[userName] = {
//                         $exists:true
//                     };
//                     // info.wait("language");
//                     collection.find(obj).toArray(function(err,results){
//                         var objText={};
//                         var command = Number(info.text);
//                         if(command==1){
//                             command='EN';
//                             webot.config.lang = "en_us";
//                         }
//                         else if(command==2){
//                             command='CN';
//                             webot.config.lang = "zh_cn";
//                         }
//                         objText[userName]=command;
//                         if(results.length==0){
//                             next(null,"咦？发生了奇怪的事情");
//                         }
//                         else{
//                             collection.update(obj,objText,function(err,re){});

//                             var reply = utils.localizedText(webot, 
//                             {
//                                 'en_us' : 'Welcome WeLoo! use \'help\' to get more information',
//                                 'zh_cn' : '欢迎使用微信公众平台,输入Help获取帮助'
//                             });
//                             next(null, reply);
//                         }
//                     });
//                 }
//             });
//         });
// });
     

webot.set('map',{
    description:'map test',
    pattern: /^(map)/,//wtf is that
    handler: function(info){
      var gm = require('googlemaps');
      var util = require('util');
      var data;
       gm.reverseGeocode('43.464258,-80.520410', function(err, data){
        console.log(data);
        });

        // gm.reverseGeocode(gm.checkAndConvertPoint([41.850033, -87.6500523]), function(err, data){
        // util.puts(JSON.stringify(data));
        // });
        output = "看你妈！"
        return output;
    }
  });

// Speech Recognization
  webot.set('speech recognition', {
    description: '微信语音识别',
    pattern: function(info) {
      return info.is('voice') || info.type === 'voice';
    },
    handler: function(info, next) {
      next(null, info.param.recognition);
    }

  });


  webot.waitRule('wait_suggest_keyword', function(info, next){
    if (!info.text) {
      return next();
    }

    // 按照定义规则的 name 获取其他 handler
    var rule_search = webot.get('search');

    // 用户回复回来的消息
    if (info.text.match(/^(好|要|y)$/i)) {
      // 修改回复消息的匹配文本，传入搜索命令执行
      info.param[0] = 's nodejs';
      info.param[1] = 'nodejs';

      // 执行某条规则
      webot.exec(info, rule_search, next);
      // 也可以调用 rule 的 exec 方法
      // rule_search.exec(info, next);
    } else {
      info.param[1] = info.session.last_search_word;
      // 或者直接调用 handler :
      rule_search.handler(info, next);
      // 甚至直接用命名好的 function name 来调用：
      // do_search(info, next);
    }
    // remember to clean your session object.
    delete info.session.last_search_word;
  });

  // 调用已有的action
  webot.set('suggest keyword', {
    description: '发送: s nde ,然后再回复Y或其他',
    pattern: /^(?:搜索?|search|s\b)\s*(.+)/i,
    handler: function(info){
      var q = info.param[1];
      if (q === 'nde') {
        info.session.last_search_word = q;
        info.wait('wait_suggest_keyword');
        return '你输入了:' + q + '，似乎拼写错误。要我帮你更改为「nodejs」并搜索吗?';
      }
    }
  });

  function do_search(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }

  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });


  webot.waitRule('wait_timeout', function(info) {
    if (new Date().getTime() - info.session.wait_begin > 5000) {
      delete info.session.wait_begin;
      return '你的操作超时了,请重新输入';
    } else {
      return '你在规定时限里面输入了: ' + info.text;
    }
  });

  // 超时处理
  webot.set('timeout', {
    description: '输入timeout, 等待5秒后回复,会提示超时',
    pattern: 'timeout',
    handler: function(info) {
      info.session.wait_begin = new Date().getTime();
      info.wait('wait_timeout');
      return '请等待5秒后回复';
    }
  });

  /**
   * Wait rules as lists
   *
   * 实现类似电话客服的自动应答流程
   *
   */
  webot.set(/^ok webot$/i, function(info) {
    info.wait('list');
    return '可用指令：\n' +
           '1 - 查看程序信息\n' +
           '2 - 进入名字选择';
  });
  webot.waitRule('list', {
    '1': 'webot ' + package_info.version,
    '2': function(info) {
      info.wait('list-2');
      return '请选择人名:\n' +
             '1 - Marry\n' +
             '2 - Jane\n' +
             '3 - 自定义'
    }
  });
  webot.waitRule('list-2', {
    '1': '你选择了 Marry',
    '2': '你选择了 Jane',
    '3': function(info) {
      info.wait('list-2-3');
      return '请输入你想要的人';
    }
  });
  webot.waitRule('list-2-3', function(info) {
    if (info.text) {
      return '你输入了 ' + info.text;
    }
  });

//calculate distance between two locations
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    if (unit=="meter") { dist = dist * 1.609344*1000 }
    return dist
}

  //支持location消息 此examples使用的是高德地图的API
  //http://restapi.amap.com/rgeocode/simple?resType=json&encode=utf-8&range=3000&roadnum=0&crossnum=0&poinum=0&retvalue=1&sid=7001&region=113.24%2C23.08
  webot.set('check_location', {
    description: '发送你的经纬度,我会查询你和SLC Tim Hortons之间的距离',
    pattern: function(info){
      return info.is('location');
    },
    handler: function(info, next){
      console.log("location checking");

      console.log("lat: " + info.param.lat);
      console.log("long: " + info.param.lng);
      var dis = distance(info.param.lat,info.param.lng,43.471324,-80.545186,"meter");
      var gm = require('googlemaps');
      var util = require('util');
      var data;
      var output = "";
      var address = "";
      var s = info.param.lat.toString();
      var distance_to_slc_tim = Math.ceil(dis);
      s +=",";
      s += info.param.lng.toString();
       gm.reverseGeocode(s, function(err, data){
        if(data.results.length<1){
          output = utils.localizedText(webot, 
        {
          'en_us' : "no such address. I am sorry buddy!",
          'zh_cn' : '对不起，没有这个地址'
        })
        }
        else{
          address = data.results[0].formatted_address;
          // log("address: %s", output);

          output = utils.localizedText(webot, 
        {
          'en_us' : "your current location is: "+address+"\n"+"Distance between you and SLC Tim Hortons is: "+ distance_to_slc_tim+" m",
          'zh_cn' : "您现在所在位置: "+address+"\n"+"您距离SLC的Tim Hortons的距离是: "+ distance_to_slc_tim+" m"
        })
        }
          next(null, output);
        });
      // geo2loc(info.param, function(err, location, data) {
      //   location = location || info.label;
      //   next(null, location ? '你正在' + location : '我不知道你在什么地方。');
      // });
    }
  });

  //图片
  webot.set('check_image', {
    description: '发送图片,我将返回其hash值',
    pattern: function(info){
      return info.is('image');
    },
    handler: function(info, next){
      verbose('image url: %s', info.param.picUrl);

      try{
        var shasum = crypto.createHash('md5');

        var req = require('request')(info.param.picUrl);

        req.on('data', function(data) {
          shasum.update(data);
        });
        req.on('end', function() {
          return next(null, '你的图片hash: ' + shasum.digest('hex'));
        });
      }catch(e){
        error('Failed hashing image: %s', e)
        return '生成图片hash失败: ' + e;
      }
    }
  });

  // 回复图文消息
  webot.set('reply_news', {
    description: '发送news,我将回复图文消息你',
    pattern: /^news\s*(\d*)$/,
    handler: function(info){
      var reply = [
        {title: '微信机器人', description: '微信机器人测试帐号：webot', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'https://github.com/node-webot/webot-example'},
        {title: '豆瓣同城微信帐号', description: '豆瓣同城微信帐号二维码：douban-event', pic: 'http://i.imgur.com/ijE19.jpg', url: 'https://github.com/node-webot/weixin-robot'},
        {title: '图文消息3', description: '图文消息描述3', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'http://www.baidu.com'}
      ];
      // 发送 "news 1" 时只回复一条图文消息
      return Number(info.param[1]) == 1 ? reply[0] : reply;
    }
  });

  // 可以指定图文消息的映射关系
  webot.config.mapping = function(item, index, info){
    //item.title = (index+1) + '> ' + item.title;
    return item;
  };

  // Simple conversation 
  // 简单的纯文本对话，可以用单独的 yaml 文件来定义
  require('js-yaml');
  webot.dialog(__dirname + '/dialog.yaml');

  // 支持一次性加多个（方便后台数据库存储规则）
  webot.set([{
    name: 'morning',
    description: '打个招呼吧, 发送: good morning',
    pattern: /^(早上?好?|(good )?moring)[啊\!！\.。]*$/i,
    handler: function(info){
      var d = new Date();
      var h = d.getHours();
      if (h < 3) return '[嘘] 我这边还是深夜呢，别吵着大家了';
      if (h < 5) return '这才几点钟啊，您就醒了？';
      if (h < 7) return '早啊官人！您可起得真早呐~ 给你请安了！\n 今天想参加点什么活动呢？';
      if (h < 9) return 'Morning, sir! 新的一天又开始了！您今天心情怎么样？';
      if (h < 12) return '这都几点了，还早啊...';
      if (h < 14) return '人家中午饭都吃过了，还早呐？';
      if (h < 17) return '如此美好的下午，是很适合出门逛逛的';
      if (h < 21) return '早，什么早？找碴的找？';
      if (h >= 21) return '您还是早点睡吧...';
    }
  }, {
    name: 'time',
    description: '想知道几点吗? 发送: time',
    pattern: /^(几点了|time)\??$/i,
    handler: function(info) {
      var now = moment_timezone().tz('America/Toronto');
      h = now.hours();
      var t = '现在是滑铁卢本地时间' + h + '点' + now.minutes() + '分';
      if (h < 4 || h > 22) return t + '，夜深了，早点睡吧 [月亮]';
      if (h < 6) return t + '，您还是再多睡会儿吧';
      if (h < 9) return t + '，又是一个美好的清晨呢，今天准备去哪里玩呢？';
      if (h < 12) return t + '，一日之计在于晨，今天要做的事情安排好了吗？';
      if (h < 15) return t + '，午后的冬日是否特别动人？';
      if (h < 19) return t + '，又是一个充满活力的下午！今天你的任务完成了吗？';
      if (h <= 22) return t + '，这样一个美好的夜晚，有没有去看什么演出？';
      return t;
    }
  }]);

  // 等待下一次回复
  webot.set('guess my sex', {
    pattern: /是男.还是女.|你.*男的女的/,
    handler: '你猜猜看呐',
    replies: {
      '/女|girl/i': '人家才不是女人呢',
      '/男|boy/i': '是的，我就是翩翩公子一枚',
      'both|不男不女': '你丫才不男不女呢',
      '不猜': '好的，再见',
      // 请谨慎使用通配符
      '/.*/': function reguess(info) {
        if (info.rewaitCount < 2) {
          info.rewait();
          return '你到底还猜不猜嘛！';
        }
        return '看来你真的不想猜啊';
      },
    }

    // 也可以用一个函数搞定:
    // replies: function(info){
    //   return 'haha, I wont tell you'
    // }

    // 也可以是数组格式，每个元素为一条rule
    // replies: [{
    //   pattern: '/^g(irl)?\\??$/i',
    //   handler: '猜错'
    // },{
    //   pattern: '/^b(oy)?\\??$/i',
    //   handler: '猜对了'
    // },{
    //   pattern: 'both',
    //   handler: '对你无语...'
    // }]
  });


  // 更简单地设置一条规则
  webot.set(/^more$/i, function(info){
    var reply = _.chain(webot.gets()).filter(function(rule){
      return rule.description;
    }).map(function(rule){
      //console.log(rule.name)
      return '> ' + rule.description;
    }).join('\n').value();

    return ['我的主人还没教我太多东西,你可以考虑帮我加下.\n可用的指令:\n'+ reply,
      '没有更多啦！当前可用指令：\n' + reply];
  });

  webot.set('who_are_you', {
    description: '想知道我是谁吗? 发送: who?',
    // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
    pattern: /who|你是[谁\?]+/i,
    // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
    handler: ['我是神马机器人', '微信机器人']
  });

  // 正则匹配后的匹配组存在 info.query 中
  webot.set('your_name', {
    description: '自我介绍下吧, 发送: I am [enter_your_name]',
    pattern: /^(?:my name is|i am|我(?:的名字)?(?:是|叫)?)\s*(.*)$/i,

    // handler: function(info, action){
    //   return '你好,' + info.param[1]
    // }
    // 或者更简单一点
    handler: '你好,{1}'
  });

  //所有消息都无法匹配时的fallback
  webot.set(/.*/, function(info, next){
    // 利用 error log 收集听不懂的消息，以利于接下来完善规则
    // 你也可以将这些 message 存入数据库
    console.log('unhandled message: %s', info.param.recognition);
    info.flag = true;
    var output = '';
    output = utils.localizedText(webot, {
      'en_us': 'Sorry, but I don\'t understand "' + info.text + '".',
      'zh_cn': '你发送了「' + info.text + '」,可惜我太笨了,听不懂. 发送: help 查看可用的指令'
    });
    next(null, output);
  });
};
