
const moment = require('moment');

const Notification = require('../models/notification');


exports.create = async (userIdsToBeNotified, notifierUserId, roomId, text, type) => {
  try {
    if (type == 'follow') {
      let existingNotification = await Notification.findOne({user: userIdsToBeNotified[0], notifier: notifierUserId, deactivated: null});
      if (existingNotification) {
        return;
      }
    }

    const items = userIdsToBeNotified.map(id => {
      return {
        user: id, // user to be notified
        notifier: notifierUserId, // root user that generates the notification
        room: roomId,
        text,
        type,
      };
    });
    return await Notification.insertMany(items);
  } catch(error) {
    console.log(error);
    return null;
  }
};

exports.findByUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const unreadOnly = req.query.unreadOnly === 'true' ? true : false;
    const markAsRead = req.query.markAsRead === 'true' ? true : false;

    let condition = {
      user: userId,
      deactivated: null,
    };
    if (unreadOnly) {
      condition.read = null;
    }

    const notifications = await Notification.find(condition)
      .sort({ created: -1 })
      .skip(req.skip).limit(req.limit)
      .populate({path: 'notifier', model: 'User', select: '_id fullName image username bio followers following created'})
      .populate({path: 'user', model: 'User', select: '_id fullName image username bio followers following created'})
      .populate({path: 'room', model: 'Room', select: '_id name created'})
      .exec();

    if (markAsRead) {
      for (const notification of notifications) {
        notification.read = moment().format();
        notification.save();
      }
    }

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
