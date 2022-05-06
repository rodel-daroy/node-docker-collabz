const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let schema = new mongoose.Schema({
  sendSuccess: Boolean,
  error: Mixed,
  response: Mixed,
  created: {type: Date, default: Date.now}
}, {strict: false});

module.exports = mongoose.model('Email', schema);
