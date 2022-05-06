const moment = require('moment');
const _ = require('lodash');

const Comment = require('../models/comment');
const User = require('../models/user');
const Errors = require('../helpers/errors');
const General = require('../helpers/general');
const { firestore } = require('../helpers/firestore');
const { redis, clearCache } = require('../helpers/redis');

exports.createComment = async (req, res, next) => {
  try {
    const user = req.user;
    const roomId = req.body.roomId;
    const comment = req.body.comment;

    const newComment = new Comment({
      user: user._id,
      room: roomId,
      comment
    });
    const createdComment = await newComment.save();

    firestore.collection('rooms').doc(roomId).collection('comments').doc(moment().format() + '-' + createdComment._id.toString()).set({
      _id: createdComment._id.toString(),
      userId: user._id.toString(),
      userUsername: user.username || '',
      userImage: user.image || '',
      userFullName: user.fullName || '',
      userBio: user.bio || '',
      userCreated: user.created,
      comment
    });

    res.status(201).json({ _id: createdComment._id });
  } catch(error) {
    next(error);
  }
}