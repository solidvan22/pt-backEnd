var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var cors = require('cors');

var indexRouter = require('./routes/index');
var logRouter = require('./routes/log');


var app = express();

var server = require('http').createServer(app);
io = require('socket.io')(server);
io.on('connection', function(client){
	console.log("new socket connected")
	client.on('event', function(data){});
	client.on('disconnect', function(){});
});
server.listen(3001);

app.set('secretToken', 'changeSecretInProd'); //Change secret in production environment

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/logs', logRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
