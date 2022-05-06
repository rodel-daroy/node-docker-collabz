const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const Errors = require('./api/helpers/errors');
const general = require('./api/middleware/general');

const connectionString = process.env.MONGO_ATLAS_URI;
mongoose.connect(connectionString, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
  console.log('Database Connected');

  // start cron jobs
  require('./api/jobs/jobs')();

  // generate sitemap
  require('./api/helpers/sitemap')();
}, error => {
  console.error(error);
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}));

app.use(general.allowCrossOrigin);
app.use(general.responseError);
app.use(general.responseErrorObject);
app.use(general.blacklisting);
app.use(general.checkLimitSkip);

app.get('/sitemap.xml', function(req, res) {
  return res.sendFile(__dirname + '/tmp/sitemap.xml');
});

app.use('/v1/general', require('./api/routes/general'));
app.use('/v1/files', require('./api/routes/files'));
app.use('/v1/users', require('./api/routes/users'));
app.use('/v1/rooms', require('./api/routes/rooms'));
app.use('/v1/comments', require('./api/routes/comments'));
app.use('/v1/follows', require('./api/routes/follows'));
app.use('/v1/notifications', require('./api/routes/notification'));

app.get('/v1', (req, res, next) => res.json());
app.get('/', (req, res, next) => res.json());

app.use(function (err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    err = Errors.FILE_TOO_LARGE;
  }
  if (err.message === 'invalid signature') {
    err = Errors.INVALID_SIGNATURE;
  }
  console.error(err.stack);
  const status = err.status || 500;
  const code = err.code || 3000;
  const message = err.message || err.toString();
  return res.sendError(status, code, message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Promise] - Uncaught exception...');
  console.error(reason);
  console.error(promise);
});

exports.app = app;
exports.mongoose = mongoose;
