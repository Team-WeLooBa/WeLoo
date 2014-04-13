var mongo = require('mongodb');
var mongoUri = process.env.MONGO_TEST_URI || process.env.MONGO_PROD_URI; //test URI will override PROD URI!
var collecions = ["language","restaurant"];
var utils = require('../../utils/utils.js');
var myFriend = ", 我的朋友";

module.exports = function(webot){
  webot.set('random restaurant',{
  description:'Random: 随机查询餐馆',
  pattern: /(吃啥)/,
  handler: function(info,next){
    var database = mongo.connect(mongoUri,collecions,function(err, db){
         db.collection("restaurant",function(err,collection){
          // collection.find().toArray(function(err,cb){
          //   console.log(cb);
          // });
          collection.count(function(err,result){
            var num = Math.floor((Math.random()*(result)));
            collection.find({index:num}).toArray(function(err,callback){
               var name = callback[0]['name'];
               var replyText = utils.dynamicReplyArray[Math.floor(Math.random()*((utils.dynamicReplyArray.length)))];
               // console.log(utils.dynamicReplyArray.length);
               replyText = replyText + name + myFriend;
               next(null,replyText);
                });});
          
        })})}});
}
