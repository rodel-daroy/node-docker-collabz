const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let roomSchema = new mongoose.Schema({
  creator: {type: ObjectId, ref: 'User'},
  hosts: [{type: ObjectId, ref: 'User'}],
  guests: [{type: ObjectId, ref: 'User'}],
  queue: [{type: ObjectId, ref: 'User'}],
  hostInvites: [{type: ObjectId, ref: 'User'}],
  guestInvites: [{type: ObjectId, ref: 'User'}],
  queueInvites: [{type: ObjectId, ref: 'User'}],
  recentAudience: [{type: ObjectId, ref: 'User'}],
  totalUsers: {type: Number, default: 0},
  name: String,

  ended: Date,
  created: {type: Date, default: Date.now},
  deactivated: Date
});

module.exports = mongoose.model('Room', roomSchema);
