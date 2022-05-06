const moment = require('moment');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Follow = require('../models/follow');
const Errors = require('../helpers/errors');
const General = require('../helpers/general');
const { clearCache } = require('../helpers/redis');
const Twilio = require('twilio');
const Email = require('../helpers/email');
const NotificationCtrl = require('../controllers/notifications');


let TwilioClient = new Twilio(process.env.TWILIO_ACCOUNT_ID, process.env.TWILIO_AUTH_TOKEN);
const LIMIT_DURATION_HOURS = 1;
const ATTEMPTS_LIMIT = 3;

const generateNumberId = async () => {

  // Generate a random integer
  let generated = General.getRandomInt(100001111, 999999999);

  let condition = {numberId: generated};
  try {
    const existingUser = await User.findOne(condition).lean().exec();
    if (existingUser) {
      return generateNumberId();
    } else {
      return generated;
    }
  } catch (err) {
    return generated;
  }
};

exports.signup = async (req, res, next) => {
  try {
    let phoneNumber = req.body.phoneNumber;
    let username = req.body.username;
    let fullName = req.body.fullName;

    const lastVerificationCode = getRandomCode();

    let existingUser = await User.findOne({ phoneNumber, deactivated: null }).lean().exec();
    if (existingUser) {
      if (existingUser.phoneNumberVerified) {
        throw Errors.PHONE_ALREADY_EXISTS;
      }
      // re-send code to existing user who hasn't verified yet
      if (!existingUser.lastResendAttempt || moment(existingUser.lastResendAttempt).isBefore(moment().subtract(1, 'minute'))) {
        await User.updateOne({ _id: existingUser._id }, { lastVerificationCode, lastResendAttempt: moment().format() }).exec();
        await sendSmsCode(phoneNumber, lastVerificationCode);
      }

      return res.status(200).json({ userId: existingUser._id });
    } else {
      existingUser = await User.findOne({ username, deactivated: null }).lean().exec();
      if (existingUser) {
        throw Errors.USERNAME_ALREADY_EXISTS;
      }
      let numberId = await generateNumberId();
      let newUser = new User({
        numberId,
        phoneNumber,
        username,
        fullName,
        role: 'user',
        phoneNumberVerified: null,
        lastVerificationCode,
      });
      let createdUser = await newUser.save();

      await sendSmsCode(phoneNumber, lastVerificationCode);
    
      res.status(200).json({ userId: createdUser._id });
    }
  } catch(error) {
    next(error);
  }
}

exports.login = async (req, res, next) => {
  try {
    let phoneNumber = req.body.phoneNumber;

    let user = await User.findOne({ phoneNumber, deactivated: null }).lean().exec();
    if (!user || !user.phoneNumberVerified) {
      throw Errors.CANNOT_FIND_USER;
    }

    if (!user.lastResendAttempt || moment(user.lastResendAttempt).isBefore(moment().subtract(1, 'minute'))) {
      const verificationCode = getRandomCode();
      console.log('verificationCode =====>', verificationCode)
      await User.updateOne({ _id: user._id }, {lastVerificationCode: verificationCode, lastResendAttempt: moment().format() }).exec();
      await sendSmsCode(phoneNumber, verificationCode);
    }

    res.status(200).json({ userId: user._id });
  } catch(error) {
    next(error);
  }
}

exports.userInfo = async (req, res, next) => {
  try {
    let user = { ...req.user };

    delete user.phoneNumber;
    delete user.recaptchaScore;

    res.status(200).json(user);
  } catch(error) {
    next(error);
  }
}

exports.getPublicUserById = async (req, res, next) => {
  try {
    let userId = req.params.userId;

    let user = await User.findOne({ _id: userId, deactivated: null }).lean().exec();
    if (!user) {
      return res.status(200).json({});
    }

    let userInfo = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      image: user.image,
      bio: user.bio || '',
      email: user.email || '',
    }

    res.status(200).json(userInfo);
  } catch(error) {
    next(error);
  }
}

exports.updateImage = async (req, res, next) => {
  let userId = req.user._id;
  let image = req.body.image;

  try {
    await User.updateOne({ _id: userId}, {image}).exec();
    clearCache('user=' + userId);
    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.updateEmail = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let email = req.body.email;

    let existingUser = await User.findOne({ _id: { $ne: userId }, email });
    if (existingUser) {
      throw Errors.EMAIL_ALREADY_EXISTS;
    }

    await User.updateOne({ _id: userId}, { email }).exec();
    res.status(200).json();
    clearCache('user=' + userId);
  } catch(error) {
    next(error);
  }
}

exports.updateName = async (req, res, next) => {
  let userId = req.user._id;
  let fullName = req.body.fullName;

  try {
    await User.updateOne({ _id: userId}, {fullName}).exec();
    clearCache('user=' + userId);
    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.updateUsername = async (req, res, next) => {
  let userId = req.user._id;
  let username = req.body.username;

  try {
    let existingUser = await User.findOne({ _id: { "$ne": userId }, username });
    if (existingUser) {
      next(Errors.USERNAME_ALREADY_EXISTS);
    } else {
      await User.updateOne({ _id: userId}, {username}).exec();
      clearCache('user=' + userId);
      res.status(200).json();
    }
  } catch(error) {
    next(error);
  }
}

exports.updateBio = async (req, res, next) => {
  let userId = req.user._id;
  let bio = req.body.bio;

  try {
    await User.updateOne({_id: userId}, {bio}).exec();
    clearCache('user=' + userId);
    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

async function sendSmsCode(phoneNumber, randomCode) {
  try {
    const message = `Welcome to Collabz! Here's your code: ${randomCode}`;
    if (process.env.NODE_ENV != 'production') {
      console.log('[Dev Environment: SMS was not sent to ' + phoneNumber + '] ' + message);
      return;
    }

    await TwilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message
    });

  } catch (err) {
    console.log(err);
    throw Errors.PHONE_TEXT_FAIL;
  }
};

exports.resendCode = async (req, res, next) => {
  try {
    const userId = req.body.userId;

    const user = await User.findOne({ _id: userId, deactivated: null }).lean().exec();
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const now = moment();
    const lastResendAttempt = user.lastResendAttempt ? moment(user.lastResendAttempt) : moment();
    const durationSincePreviousResend = moment.duration(now.diff(lastResendAttempt)).asMinutes();
    if (durationSincePreviousResend < 1) {
      return res.status(200).json(); // don't tell the user that we didn't send it again
    }

    const failedAttempts = user.failedAttempts || 0;
    const lastFailedAttempt = user.lastFailedAttempt ? moment(user.lastFailedAttempt) : moment();
    const durationDiff = moment.duration(now.diff(lastFailedAttempt));
    const duration = durationDiff.asHours();

    if (failedAttempts > ATTEMPTS_LIMIT && duration < LIMIT_DURATION_HOURS) {
      return res.status(200).json();
    }
    const randomCode = getRandomCode();
    await User.updateOne({ _id: user._id }, {
      lastVerificationCode: randomCode,
      lastResendAttempt: moment().valueOf(),
    });
    await sendSmsCode(user.phoneNumber, randomCode);
    
    res.status(200).json();
  } catch (err) {
    next(err);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const verificationCode = req.body.verificationCode;

    let user = await User.findOne({ _id: userId, deactivated: null }).lean().exec();
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // incorrect verification code
    if (user.lastVerificationCode != verificationCode) {
      let failedAttempts = user.failedAttempts || 0;
      const lastFailedAttempt = user.lastFailedAttempt ? moment(user.lastFailedAttempt) : moment();
      const durationDiff = moment.duration(moment().diff(lastFailedAttempt));
      const duration = durationDiff.asHours();

      // In case of reach the duration limit blocking restart the counter
      if (duration >= LIMIT_DURATION_HOURS && failedAttempts > ATTEMPTS_LIMIT) {
        failedAttempts = 0;
      }
      if (failedAttempts > ATTEMPTS_LIMIT && duration < LIMIT_DURATION_HOURS) {
        throw Errors.WAIT_TO_VERIFY;
      } else {
        await User.updateOne({ _id: user._id }, {failedAttempts: failedAttempts + 1, lastFailedAttempt: moment().format() });
        throw Errors.VERIFY_CODE_INVALID;
      }
    }

    // correct verification code
    await User.updateOne({
      _id: user._id,
    }, {
      phoneNumberVerified: user.phoneNumberVerified || moment().format(),
      lastVerificationCode: null,
      failedAttempts: 0,
      lastFailedAttempt: null,
      lastResendAttempt: null,
    }).exec();

    const token = jwt.sign({
      userId: user._id,
      created: moment().valueOf(),
    }, process.env.JWT_KEY, { expiresIn: '1y' });

    let currentUser = { ...user };
    delete currentUser.phoneNumber;
    delete currentUser.recaptchaScore;

    res.status(200).json({ token, currentUser });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let blockUserId = req.body.blockUserId;

    await User.updateOne({ _id: userId }, { $addToSet: { blocks: blockUserId } }).exec();
    res.status(200).json();
    clearCache('user=' + userId);
  } catch(error) {
    next(error);
  }
}

exports.unblockUser = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let blockUserId = req.body.blockUserId;

    await User.updateOne({ _id: userId }, { $pullAll: { blocks: [blockUserId] } }).exec();
    res.status(200).json();
    clearCache('user=' + userId);
  } catch(error) {
    next(error);
  }
}

exports.reportUser = async (req, res, next) => {
  try {
    let user = req.user;
    let reportUserId = req.body.reportUserId;
    let reportComment = req.body.reportComment;

    const reportUser = await User.findOne({ _id: reportUserId }).lean().exec();
    if (!reportUser) {
      return res.status(200).json();
    }

    await Email.sendReportUser(reportUserId, reportUser.fullName, reportUser.username, reportUser.email, reportComment, user._id, user.username);
    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.followUser = async (req, res, next) => {
  try {
    let user = req.user;
    let followUserId = req.body.followUserId;

    if ((user.followingUsers || []).map(u => u.toString()).indexOf(followUserId) >= 0) {
      return res.status(200).json(); // already being followed
    }

    await User.updateOne({ _id: user._id }, { $addToSet: { followingUsers: followUserId } }).exec();
    await User.updateOne({ _id: user._id }, { $inc: { following: 1 } }).exec();

    let newFollow = new Follow({
      follower: user._id,
      followee: followUserId
    });
    await newFollow.save();

    await User.updateOne({ _id: followUserId }, { $inc: { followers: 1 } }).exec();

    await NotificationCtrl.create([followUserId], user._id, null, 'followed you', 'follow');

    res.status(200).json();
    clearCache('user=' + user._id);
    clearCache('user=' + followUserId);
  } catch(error) {
    next(error);
  }
}

exports.unfollowUser = async (req, res, next) => {
  try {
    let user = req.user;
    let unfollowUserId = req.body.unfollowUserId;

    let existingFollow = await Follow.findOne({ follower: user._id, followee: unfollowUserId, deactivated: null }).exec();
    if (existingFollow) {
      existingFollow.deactivated = moment().format();
      await existingFollow.save();
    }

    let newFollowingUsers = (user.followingUsers || []).map(u => u.toString()).filter(u => u != unfollowUserId);
    await User.updateOne({ _id: user._id }, { followingUsers: newFollowingUsers }).exec();
    let newFollowing = user.following - 1;
    if (newFollowing < 0) {
      newFollowing = 0;
    }
    await User.updateOne({ _id: user._id }, { following: newFollowing }).exec();

    let unfollowUser = await User.findOne({ _id: unfollowUserId, deactivated: null }).exec();
    if (unfollowUser) {
      let newFollowers = unfollowUser.followers - 1;
      if (newFollowers < 0) {
        newFollowers = 0;
      }
      unfollowUser.followers = newFollowers;
      await unfollowUser.save();
    }

    res.status(200).json();
    clearCache('user=' + user._id);
    clearCache('user=' + unfollowUserId);
  } catch(error) {
    next(error);
  }
}

exports.getBlocked = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findOne({ _id: userId, deactivated: null }).populate('blocks').lean().exec();
    let blockedUsers = [];

    if (user && user.blocks && user.blocks.length > 0) {
      blockedUsers = user.blocks.map((blockedUser) => {
        return {
          _id: blockedUser._id,
          username: blockedUser.username,
          fullName: blockedUser.fullName,
          image: blockedUser.image,
        };
      });
    }
    res.status(200).json(blockedUsers);
  } catch (error) {
    next(error);
  }
};

function getRandomCode() {
  return Math.floor(100000 + Math.random() * 900000);
}