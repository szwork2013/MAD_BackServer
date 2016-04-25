var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var wilddog = require('wilddog');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var advertiser = require('./routes/advertiser');
var user = require('./routes/user');
var admin = require('./routes/admin');

/*---------------------野狗云初始化鉴权---------------------*/
var superToken='vt3sPR4f6UanTCFANnyRhud7TvW0l1Ctq4hR8XUo';
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
ref.authWithCustomToken(superToken,(error,authData)=>{
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
  }
});
/*---------------------野狗云初始化鉴权---------------------*/

/*---------------------公共常用工具---------------------*/
var utils = require('./lib/publicUtils');
console.log('Token example: ' + utils.getToken('userid111111111'));//getToken(userid);

//*****通过一个子键值得到该子键所在节点的数据快照，直接就是json格式无需再.val()*****//
//#####警告：务必确保该子键值的唯一性，随做了防崩处理但是处理的很粗暴，仅仅只是只返回第一条结果而已，暂时未有好的方法#####//
setTimeout(()=>{
  utils.Query_EqualTo(ref.child('user'),'name','Apple',(snap)=>{
    if(snap == null){             //匹配结果为空
      console.log('匹配结果为空');
    }
    else
    {
      console.log(snap);
    }
  })
},3000);
/*---------------------公共常用工具---------------------*/
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/advertiser', advertiser);
app.use('/user', user);
app.use('/back', admin); //以前是app.use('/admin', admin), 与接口命名不一致(接口以back开始), 这样的话路由变为/admin/back, 多了一级，现改为back, 朱哥你也改一下吧

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
