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

var superToken='vt3sPR4f6UanTCFANnyRhud7TvW0l1Ctq4hR8XUo';
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');

ref.authWithCustomToken(superToken,(error,authData)=>{
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
  }
});

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
app.use('/admin',admin);

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