var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
// Require handlebars and just-handlebars-helpers
const Handlebars = require('handlebars');
const H = require('just-handlebars-helpers');
// Register just-handlebars-helpers with handlebars
H.registerHelpers(Handlebars);
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var loginRouter=require('./routes/login');
var fileUpload = require('express-fileupload')
var app = express();
var db = require('./config/connection');
var session = require('express-session');
var MongoStore=require('connect-mongo')(session);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

db.connect((err)=>{

  if(err)
  console.log("Db Connection error"+err);
  else
  console.log("Db connected");
});
app.use(session({secret:'Key',
cookie:{maxAge:600000},
resave: true,
saveUninitialized: true,
store:new MongoStore({url:'mongodb://localhost:27017/shopping'}),

}))

app.use('/', userRouter);
app.use('/login',loginRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

Handlebars.registerHelper("multiply", function(thing1, thing2) {
  return thing1 * thing2;
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
