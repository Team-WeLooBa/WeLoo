# WeLoo 微卢 - A [Webot](https://github.com/node-webot/weixin-robot) Application [![Build Status](https://api.travis-ci.org/node-webot/webot-example.png?branch=master)](https://travis-ci.org/node-webot/webot-example)

- WeChat Account (English): wewaterloo
- 微信账号 (中文): wewaterloo_cn

WeLoo is an open WeChat plaform for University of Waterloo students, the server side is built by Team WeluuBA at 2014 Water Hackathon. The platform is providing specific searching service for university student.

微卢是一个面向滑铁卢大学学生的微信公众账号，由WeLuuBa团队成猿在2014 Water Hackathon中开发完成后台。主要提供面向大学生的信息查询服务。

## Functions 功能
- Exam Schedule Lookup 考试信息查询
- Food Services Open Hours, Menu, and Location Lookup 学校餐饮服务信息查询
- Waterloo Weather Information 滑铁卢天气信息查询
- More Functions are Developing... 更多功能开发中...

## Run on Local Machine 本地运行

```bash
git clone https://github.com/slovey528/WeLoo.git
cd WeLoo/
npm install
make start UW_API_TOKEN=TOKEN MONGO_TEST_URI=mongodb://username:password@oceanic.mongohq.com:10087/app_sample
```
Use `make start` to run `node app.js`. 使用`make start` 命令会调用 `node app.js` 。

## Message Test 消息调试

Use [`webot-cli`](https://github.com/node-webot/webot-cli) command line tool to test the message.
使用 [`webot-cli`](https://github.com/node-webot/webot-cli) 命令行工具来发送测试消息。

For more information about [wechat-robot](https://github.com/node-webot/weixin-robot) and how to [test](https://github.com/node-webot/webot-cli), please go to the github page.

## Team WeluuBA 开发者
- [Jerry Mao](http://slovey528.github.io)
- [Ken Huang](https://github.com/y88huang)
- [Elton Gao](http://gyfelton.github.io)
- [Frank Li](http://xuefei-frank.com)
- [Chao Chen](https://github.com/mellwa)
- [Irene Jiang](https://github.com/iJuliet)

## Credit
- University of Waterloo Open Data

- [weixin-robot](https://github.com/node-webot/weixin-robot), 
[Original Version](https://github.com/node-webot/weixin-robot/tree/0.0.x) developed by [@ktmud](https://github.com/ktmud), 
[@atian](https://github.com/atian25) refactored and finished version 0.2.

- [weixin-robot](https://github.com/node-webot/weixin-robot) used [wechat](https://github.com/node-webot/wechat) developed by [@JacksonTian](https://github.com/JacksonTian).
