const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
  numberId: Number,
  phoneNumber: {type: String, required: true, unique: true},
  username: {type: String, required: true, unique: true},
  fullName: {type: String, maxlength: [150, 'Name is too long']},
  role: {type: String, enum: ['user', 'admin'], required: true},
  image: String,
  followers: {type: Number, default: 0},
  following: {type: Number, default: 0},
  followingUsers: [{type: ObjectId, ref: 'User'}],
  recaptchaScore: {type: Number, default: -1},
  invalidated: Date,
  bio: {type: String, required: false},
  email: {type: String, required: false},
  phoneNumberVerified: Date,
  lastVerificationCode: String,
  failedAttempts: Number,
  lastFailedAttempt: Date,
  lastResendAttempt: Date,
  blocks: [{type: ObjectId, ref: 'User'}],
  
  created: {type: Date, default: Date.now},
  deactivated: {type: Date}
});

schema.index({phoneNumber: 'text', username: 'text', fullName: 'text'}, {weights: {phoneNumber: 10, username: 8, fullName: 1}, name: "user_text_index"});
schema.index({role: 1}, {name: 'user_role_index'});

module.exports = mongoose.model('User', schema);
