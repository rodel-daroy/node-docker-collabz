const url = require('url');
const Redis = require('ioredis');
const moment = require('moment');

const REDIS_URL = process.env.REDIS_URL;
const redis_uri = url.parse(REDIS_URL);
const redisOptions = REDIS_URL.includes('rediss://')
  ? {
      port: Number(redis_uri.port),
      host: redis_uri.hostname,
      password: redis_uri.auth.split(':')[1],
      db: 0,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : REDIS_URL;
const redis = new Redis(redisOptions);


let isRedisConnected = false;

exports.getIsRedisConnected = () => {
  return isRedisConnected;
}
exports.redis = redis;

redis.on('error', (error) => {
  isRedisConnected = false;
  console.error('Redis error=');
  console.error(error);
});

redis.on('connect', () => {
  console.log('Redis Connected')
  isRedisConnected = true;
});

exports.clearCache = async (...patterns) => {
  try {
    if (!isRedisConnected) {
      return;
    }
    for (const pattern of patterns) {
      const keys = await redis.keys('*' + pattern + '*');

      for (let i = 0, len = keys.length; i < len; i++) {
        console.log('Removing:', keys[i]);
        redis.del(keys[i]);
      }
    }
  } catch(err) {
    console.error('clearCache err=');
    console.error(err);
  }
};

exports.cache = async (req, res, next) => {
  try {
    if (!isRedisConnected || (req.query && req.query.noCache)) {
      return next();
    }
    let key = req.originalUrl;
    if (req.user) {
      key += ':userId=' + req.user._id;
    }
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log('hit=', key);
      res.locals.cacheHit = true;
      res.json(JSON.parse(cachedData));
      return;
    } else {
      console.log('miss=', key);
      const oldSend = res.json;
      res.json = (data) => {
        redis.setex(key, 60 * 60 * 24, JSON.stringify(data)); // default to 24 hours
        res.json = oldSend;
        return res.json(data);
      }
      next();
    }
  } catch (err) {
    console.log('cache err=', err);
    next();
  }
}
