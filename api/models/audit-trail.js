const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

let schema = new mongoose.Schema({
  ipAddress: {type: String, required: true},
  user: {type: ObjectId, ref: 'User'},
  route: {type: String, required: true},
  method: {type: String, required: true},
  data: Mixed,
  userAgent: String,
  platform: String,
  platformVersion: String,
  appVersion: String,
  appBundle: String,
  deviceId: String,

  created: {type: Date, default: Date.now}
});

schema.index({created: 1}, {name: "auditTrail_range_index"});

module.exports = mongoose.model('AuditTrail', schema);
