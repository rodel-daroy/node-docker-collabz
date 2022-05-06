const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let followSchema = new mongoose.Schema({
  follower: {type: ObjectId, ref: 'User'}, // the person doing the following
  followee: {type: ObjectId, ref: 'User'}, // the person being followed

  created: {type: Date, default: Date.now},
  deactivated: Date
});

module.exports = mongoose.model('Follow', followSchema);
