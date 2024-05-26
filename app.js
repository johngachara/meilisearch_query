var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/addstock1');
var Shop2StockRouter = require('./routes/addstock2');
var searchRouter = require('./routes/search');
var search2 = require('./routes/search2')
var updateRouter = require('./routes/update');
var updateRouter2 = require('./routes/update2')
var registerRouter = require('./routes/register');
var authRouter = require('./routes/authenticate');
var deleteRouter = require('./routes/delete')
var deleteRouter2 = require('./routes/delete2');
let Connect = require("./config/db")
var auth = require('./auth/auth')
Connect()
const cors = require('cors')
require('dotenv').config();
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin:"*", // Specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shop2stock',Shop2StockRouter);
app.use('/search',auth,searchRouter);
app.use('/search2',search2)
app.use('/update',updateRouter);
app.use('/update2',updateRouter2);
app.use('/register',registerRouter);
app.use('/authenticate',authRouter)
app.use('/delete',deleteRouter)
app.use('/delete2',deleteRouter2)
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
  res.render('error');
});

module.exports = app;
