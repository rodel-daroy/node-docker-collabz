const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let commentSchema = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  room: {type: ObjectId, ref: 'Room'},
  comment: String,
  reported: [{type: ObjectId, ref: 'User'}],

  created: {type: Date, default: Date.now},
  deactivated: Date
});

module.exports = mongoose.model('Comment', commentSchema);
