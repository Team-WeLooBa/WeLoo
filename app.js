var express = require('express');
var webot_lib = require('weixin-robot');
var log = require('debug')('weloo:log');
var verbose = require('debug')('weloo:verbose');
var secret = require('./private/secret.js');


// 启动服务
var app = express();

// 实际使用时，这里填写你在微信公共平台后台填写的 token
// FIXME: remove second token?
var tokenName = secret.wechatServerToken[0];
var wx_token = process.env.WX_TOKEN || tokenName;

// 建立多个实例，并监听到不同 path, 目前对应不同语言
var webot_en_us = new webot_lib.Webot({'lang':'en_us'});
var webot_zh_cn = new webot_lib.Webot({'lang':'zh_cn'});

// 载入webot1的回复规则
require('./rules')(webot_en_us);
// 为webot2也指定规则
require('./rules')(webot_zh_cn);

// 启动机器人, 接管 web 服务请求
webot_en_us.watch(app, { token: wx_token, path: '/wechat_en_us' });
// 若省略 path 参数，会监听到根目录
// webot.watch(app, { token: wx_token });

// 后面指定的 path 不可为前面实例的子目录
webot_zh_cn.watch(app, { token: wx_token, path: '/wechat_zh_cn' });

// 如果需要 session 支持，sessionStore 必须放在 watch 之后
app.use(express.cookieParser());
// 为了使用 waitRule 功能，需要增加 session 支持
app.use(express.session({
  secret: 'abced111',
  store: new express.session.MemoryStore()
}));
// 在生产环境，你应该将此处的 store 换为某种永久存储。
// 请参考 http://expressjs.com/2x/guide.html#session-support

// 在环境变量提供的 $PORT 或 3000 端口监听
var port = process.env.PORT || 3000;
app.listen(port, function(){
  log("Listening on %s", port);
});

// 微信接口地址只允许服务放在 80 端口
// 所以需要做一层 proxy
app.enable('trust proxy');

// 当然，如果你的服务器允许，你也可以直接用 node 来 serve 80 端口
// app.listen(80);

if(!process.env.DEBUG){
  console.log("set env variable `DEBUG=webot-example:*` to display debug info.");
}
