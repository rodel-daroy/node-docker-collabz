function getIpAddress(req) {
  let ipAddress = req.headers['x-forwarded-for'];
  ipAddress = ipAddress ? ipAddress.split(',').pop() : req.connection.remoteAddress;
  req.ipAddress = ipAddress;
  return ipAddress;
}

const blacklist = {};
const safeUrls = [];

const blockedIPList = process.env.BLOCK_IP || '999';
const blockedIPs = blockedIPList.split(',');
for(let i = 0; i < blockedIPs.length; i++) {
  blacklist[blockedIPs[i]] = 999;
}

function addToBlacklist(ip, url) {
  let isSafe = false;
  for(let i = 0; i < safeUrls.length; i++) {
    if(url.indexOf(safeUrls[i]) >= 0) {
      isSafe = true;
      break;
    }
  }
  if(!isSafe) {
    if(blacklist[ip]) {
      blacklist[ip]++;
    } else {
      blacklist[ip] = 1;
    }
  }
}

/**
 * Handles client and database errors
 */
exports.responseError = (req, res, next) => {
  res.sendError = (status, code, message) => {
    const ip = getIpAddress(req);

    addToBlacklist(ip, req.url);

    if(status) res.status(status);
    else res.status(400);
    return res.json({
      'error': {
        'code': code ? code : 3000,
        'message': message ? message : 'Server Error'
      }
    });
  };
  return next();
};

exports.responseErrorObject = (req, res, next) => {
  res.sendErrorObject = (err) => {
    console.log(err);
    return res.sendError(err.status, err.code, err.message)
  };
  return next();
};

/**
 * Handles blacklisting repeated abuse of system
 */
exports.blacklisting = (req, res, next) => {
  if(req.method == 'PATCH' || req.method == 'TRACE') {
    return res.sendError(400, 2910, 'Too many bad requests. Please try again later or contact support@collabzapp.com');
  }

  const ip = getIpAddress(req);
  if(req.url.indexOf('/v1/') != -1 && blacklist[ip] && blacklist[ip] > 50) {
    return res.sendError(400, 2910, 'Too many bad requests. Please try again later or contact support@collabzapp.com');
  }
  return next();
};

exports.allowCrossOrigin = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, content-type, authorization, bypass-error-interceptor, platform, platform-version, app-version, app-bundle, device-id'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
};

exports.checkLimitSkip = (req, res, next) => {
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      limit = 20;
    }
    req.limit = limit;
  } else {
    req.limit = 20;
  }

  if (req.query.skip) {
    let skip = parseInt(req.query.skip);
    if (isNaN(skip) || skip < 0) {
      skip = 0;
    }
    req.skip = skip;
  } else {
    req.skip = 0;
  }

  next();
};
