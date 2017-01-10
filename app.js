/**
 * Module dependencies.
 */
const newrelic = require('newrelic');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const rollbar = require('rollbar');
const LaunchDarkly = require('ldclient-node');

const client = LaunchDarkly.init('sdk-628189ca-6926-4225-9e3c-eef478904618');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ silent: true });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const faqController = require('./controllers/faq');
const infoController = require('./controllers/info');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const teamsController = require('./controllers/teams');
const standingsController = require('./controllers/standings');
const scheduleController = require('./controllers/schedule');
const allstarController = require('./controllers/allstar');
const tournamentsController = require('./controllers/tournaments');
const comingSoonController = require('./controllers/comingsoon');
const notFoundController = require('./controllers/404');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  console.log(err);
  process.exit();
});

/**
 * Express configuration.
 */
app.locals.env = process.env;
app.locals.ldclient = client;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.originalUrl}`);
  }
  next();
});
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/register' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/faq', faqController.index);
app.get('/rules', infoController.rules);
app.get('/fields', infoController.fields);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/register', userController.getRegister);
app.post('/register', userController.postRegister);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get('/sponsors', comingSoonController.index);
app.get('/teams', teamsController.index);
app.get('/schedule', scheduleController.index);
app.get('/standings', standingsController.index);
app.get('/tournaments', tournamentsController.index);
app.get('/allstar', allstarController.index);
app.get('/halloffame', comingSoonController.index);
app.get('/organization', comingSoonController.index);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/google-maps', apiController.getGoogleMaps);

app.get('/auth/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req, res) => {
  if (!req.user) {
    throw new Error('user null');
  }
  console.log(req.user);
  res.redirect('/account');
});

app.get('/.well-known/acme-challenge/:acmeToken', (req, res) => {
  const acmeToken = req.params.acmeToken;
  let acmeKey;

  if (process.env.ACME_KEY && process.env.ACME_TOKEN) {
    if (acmeToken === process.env.ACME_TOKEN) {
      acmeKey = process.env.ACME_KEY;
    }
  }

  for (const key in process.env) {
    if (key.startsWith('ACME_TOKEN_')) {
      const num = key.split('ACME_TOKEN_')[1];
      if (acmeToken === process.env[`ACME_TOKEN_${num}`]) {
        acmeKey = process.env[`ACME_KEY_${num}`];
      }
    }
  }

  if (acmeKey) res.send(acmeKey);
  else res.status(404).send();
});

app.get('*', notFoundController.index);


/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
} else {
  app.use(rollbar.errorHandler(process.env.ROLLBAR_ACCESS_TOKEN));
}

/**
 * Start Express server.
 */
client.once('ready', () => {
  app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));

    console.log('  Press CTRL-C to stop\n');
  });
});

module.exports = app;
