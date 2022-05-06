const moment = require('moment');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const Errors = require('../helpers/errors');
const User = require('../models/user');
const AuditTrail = require('../models/audit-trail');
const { redis, getIsRedisConnected } = require('../helpers/redis');

exports._getIpAddress = (req) => {
  const ipAddress = req.headers['x-forwarded-for'];
  return ipAddress ? ipAddress.split(',').pop() : req.connection.remoteAddress;
};

exports._audit = (req, forceSave) => {
  const allowedAuditMethods = ['POST', 'PUT', 'DELETE'];

  if(forceSave || (_.includes(allowedAuditMethods, req.method.toUpperCase()))) {
    // remove any password-related fields
    const body = _.cloneDeep(req.body);
    Object.keys(body).forEach((key, index) => {
      if (key.toLowerCase().indexOf('password') >= 0) {
        body[key] = null;
      }
    });

    const ipAddress = exports._getIpAddress(req);
    const userId = req.user ? req.user._id : null;
    const route = req.originalUrl;
    const method = req.method.toUpperCase();
    const userAgent = req.headers['user-agent'];
    const platform = req.headers['platform'];
    const platformVersion = req.headers['platform-version'];
    const appVersion = req.headers['app-version'];
    const appBundle = req.headers['app-bundle'];
    const deviceId = req.headers['device-id'];

    const newAuditTrail = new AuditTrail({
      ipAddress,
      user: userId,
      route,
      method,
      data: body,
      userAgent,
      platform,
      platformVersion,
      appVersion,
      appBundle,
      deviceId
    });
    return newAuditTrail.save();
  }
};

exports.audit = (req, res, next) => {
  exports._audit(req, true);
  return next();
};

exports._authorize = async (req, forceSave) => {
  const token = req.headers['authorization'];
  if (!token) {
    throw Errors.INVALID_AUTHORIZATION;
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.JWT_KEY);

    let user = null;
    const key = 'user=' + tokenInfo.userId;
    if (getIsRedisConnected()) {
      const cachedData = await redis.get(key);
      if (cachedData) {
        user = JSON.parse(cachedData);
        console.log('user hit=' + user._id);
      }
    }
    if (!user) {
      user = await User.findOne({ _id: tokenInfo.userId, deactivated: null }).lean().exec();
      console.log('user miss=' + user._id);
      if (getIsRedisConnected()) {
        redis.setex(key, 60 * 60 * 24, JSON.stringify(user)); // default to 24 hours
      }
    }
      
    // check for login invalidations
    if (user.invalidated && (!tokenInfo.created || moment(tokenInfo.created).isBefore(moment(user.invalidated)))) {
      throw Errors.INVALID_AUTHORIZATION;
    }
    
    req.user = user;

    // only allow admins to specify a userId or created date in the request body or query params
    if (req.body && req.body.userId && ['admin'].indexOf(req.user.role) == -1 && req.user._id.toString() != req.body.userId) {
      throw Errors.INVALID_AUTHORIZATION;
    } else if (req.query && req.query.userId && ['admin'].indexOf(req.user.role) == -1 && req.user._id.toString() != req.query.userId) {
      throw Errors.INVALID_AUTHORIZATION;
    } else if (req.body && req.body.created && ['admin'].indexOf(req.user.role) == -1) {
      throw Errors.INVALID_AUTHORIZATION;
    }

    exports._audit(req, forceSave);
    return user;
  } catch (err) {
    throw Errors.INVALID_AUTHORIZATION;
  }
};

exports.authorized = (req, res, next) => {
  return exports._authorize(req).then((user) => {
    if(!user) return Promise.reject(Errors.INVALID_AUTHORIZATION);
    return next();
  }).catch((err) => {
    return res.sendErrorObject(err);
  })
};

exports.authorizedAudit = (req, res, next)=>  {
  return exports._authorize(req, true).then((user) => {
    if(!user) return Promise.reject(Errors.INVALID_AUTHORIZATION);
    return next();
  }).catch((err) => {
    return res.sendErrorObject(err);
  })
};

exports._allowRoles = (req, res, next, roles) => {
  return exports._authorize(req).then((user) => {
    if(!user || !_.includes(roles, req.user.role)) return Promise.reject(Errors.INVALID_AUTHORIZATION);
    return next();
  }).catch((err) => {
    return res.sendErrorObject(err);
  });
};

exports.optionalAuthorized = (req, res, next) => {
  return exports._authorize(req).then((user) => {
    return next();
  }).catch((err) => {
    return next();
  })
};

exports.allowRoles = (roles) => {
  return (req, res, next) => {
    return exports._allowRoles(req, res, next, roles);
  }
};

