require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mongoose = require('mongoose')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const handlebars = require('handlebars')
const handlebarsHelpers = require('handlebars-helpers');
var cors = require('cors')

handlebarsHelpers.math({
  handlebars: handlebars
});

const dashboardRouter = require("./routes/dashboard");
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");
//const indexRouter = require("./routes/index");
const reviewsRouter = require('./routes/reviews');
const applicationsRouter = require("./routes/applications");
const projectsRouter = require("./routes/projects");
const servicesRouter = require("./routes/services");
const calendarRouter = require("./routes/calendar")
const pdfRouter = require("./routes/pdf");
//const uploadRouter = require("./routes/upload");
const dashboardAdminRouter = require("./routes/dashboardAdmin");
const adaugaCalendarRouter = require("./routes/adaugaCalendar");
const contactRouter=require("./routes/contact")
const aboutRouter = require("./routes/about")
var conString = "mongodb+srv://paula:pw2020@pw2020-zxqyp.mongodb.net/proiect?retryWrites=true&w=majority";
mongoose.connect(conString, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection


db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

var app = express();

app.use(cors())
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-568846.okta.com',
  token: '00_RBh797mM-P0cDA0RQ2j5j5Z1nW8LntbGFOlPt9l'
});

const oidc = new ExpressOIDC({
  issuer: "https://dev-568846.okta.com/oauth2/default",
  client_id: "0oacrygqtxo1VmKcN4x6",
  client_secret: "ZoQrIQ0Sgbi-PwF5m9Jpiv3cksddFm9XNskg-FpS",
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'pw2020*proiect',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)

    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

function loginRequired(req, res, next) {
  //console.log(req.user)
  if (!req.user) {

    return res.status(401).render("unauthenticated");
  }

  return next();
}
function adminRequired(req, res, next) {
  //console.log(req.user)
  if (!req.user) {

    return res.status(401).render("unauthenticated");
  }

  if (req.user.profile.login != 'griguta.paula@gmail.com') {

    return res.status(401).render("unauthorized");
  }

  return next();
}

app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/dashboardAdmin', adminRequired, dashboardAdminRouter);
app.use('/users', usersRouter);
//app.use('/index', indexRouter);
app.use('/reviews', loginRequired, reviewsRouter)
app.use('/applications', applicationsRouter);
app.use('/projects', projectsRouter);
app.use('/services', servicesRouter);
app.use('/my-project', loginRequired, calendarRouter);
app.use('/pdf', loginRequired, pdfRouter);
//app.use('/upload', loginRequired, uploadRouter);
app.use('/adaugaLucrare', adminRequired, adaugaCalendarRouter)
app.use('/contact', contactRouter)
app.use('/about', aboutRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


oidc.on('ready', () => {
  app.listen(4000, () => console.log('app started'));
});
module.exports = app;
