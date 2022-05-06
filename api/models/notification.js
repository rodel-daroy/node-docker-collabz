const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let notificationSchema = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'}, // the person who got notified
  notifier: {type: ObjectId, ref: 'User'}, // the person doing the notifying
  room: {type: ObjectId, ref: 'Room'},
  text: String,
  read: Date,
  type: {type: String, enum: ['room', 'follow'], required: true},

  created: {type: Date, default: Date.now},
  deactivated: Date
});

module.exports = mongoose.model('Notification', notificationSchema);
