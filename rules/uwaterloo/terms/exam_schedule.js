var uwapi = require('../../../utils/uwapi');
var utils = require('../../../utils/utils');


/**
 * If next request from user is valid, then return next()
 */
module.exports = function(webot) {
  // Exam Command Rule
  webot.waitRule('wait_course', function(info, next) {
    info = utils.sanitizeInfo(info);

    console.log(info.text);
    
    if (utils.findCommand(info.text)) {
      console.log('Next Command is: '+info.text);
      return next();
    }
    
    var invalid_format_reply = utils.localizedText(webot, 
      {
        'en_us' : 'Invalid format. Please follow this format: CS116 MATH115 ECON101',
        'zh_cn' : '格式不正确，请仿照以下格式：CS116 MATH115 ECON101'
      });
    var no_match_reply = utils.localizedText(webot,
      {
        'en_us' : 'Oops! No match!\nPlease try again.',
        'zh_cn' : '抱歉，查无此课！\n请重新输入。'
      });

    try{
      var subjects = info.text.match(/\D+/g);
      var catalogNums = info.text.match(/\d+/g);
      console.info("Subjects: " + subjects);
      console.info("Course Numbers: " + catalogNums);

      var requestCounter = subjects.length;
      var titles = new Array();
      var descriptions = new Array();
      for (var i = 0; i < subjects.length; i++) {
        (function(i) {
          var subject = subjects[i].trim();
          var catalogNum = catalogNums[i].trim();
          uwapi.getjson('courses/'+subject+'/'+catalogNum+'/examschedule', function(data) {
            //No Course found
            if (data['meta']['message'] == 'No data returned') {
              info.rewait();
              next(null, no_match_reply);
            } else {
              data = data['data'];
              var course = data['course'];
              var sections = data['sections'];
              var result = new Array();
              result.push(course+":");
              for (var i = 0; i < sections.length; i++) {
                var section = sections[i]['section'];
                var day = sections[i]['day'];
                var date = sections[i]['date'];
                var start = sections[i]['start_time'];
                var end = sections[i]['end_time'];
                var location = sections[i]['location'];
                var exam = 'Section: '+section+', '+location;
                result.push(exam);
              }
              titles.push(course+'\n'+date+' '+day+'\n'+start+' - '+end);
              descriptions.push(result.join('\n'));

              requestCounter--;
              if (requestCounter == 0) {
                var finalDesc = descriptions.join('\n') + 
                utils.localizedText(webot, 
                {
                  'en_us' : '\nFor Exam Calendar, Click 「Read All」',
                  'zh_cn' : '\n查看考试日历，请点击「阅读全文」'
                });
                var reply = {
                  title: titles.join('\n\n'),
                  description: finalDesc,
                  url: 'http://www.uwexam.com'
                };
                info.rewait();
                next(null, reply);
              }
            }
          });
        })(i);
      }
    } catch(err) {
      info.rewait();
      next(null, invalid_format_reply);
    }
  });

  webot.set('exam schedule', {
    description: 'Use \'exam\' command to get exam schedule of a course or a list of course',
    pattern: /^(exam|考试)(\s*)/i,
    handler: function(info) {
      info = utils.sanitizeInfo(info);
      info.wait('wait_course');
      return utils.localizedText(webot, 
        {
          'en_us' : 'Please enter your courses, e.g. CS116 MATH115 ECON101',
          'zh_cn' : '请输入你的课程, 例如：CS116 MATH115 ECON101'
        }
      );
    }
  });
}