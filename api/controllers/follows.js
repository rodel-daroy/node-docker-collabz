const moment = require('moment');
const _ = require('lodash');

const Follow = require('../models/follow');
const Errors = require('../helpers/errors');
const General = require('../helpers/general');

exports.findFollowers = async (req, res, next) => {
  try {
    let userId = req.params.userId;

    let follows = await Follow.find({ followee: userId, deactivated: null })
      .skip(req.skip).limit(req.limit)
      .populate({path: 'follower', model: 'User', select: '_id fullName image username bio followers following created'})
      .lean().exec();

    res.status(200).json(follows);
  } catch(error) {
    next(error);
  }
}

exports.findFollowing = async (req, res, next) => {
  try {
    let userId = req.params.userId;

    let follows = await Follow.find({ follower: userId, deactivated: null })
      .skip(req.skip).limit(req.limit)
      .populate({path: 'followee', model: 'User', select: '_id fullName image username bio followers following created'})
      .lean().exec();

    res.status(200).json(follows);
  } catch(error) {
    next(error);
  }
}
