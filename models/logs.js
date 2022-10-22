const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newLogsSchema = new Schema({
  name: String,
  type: String,
  action: String,
  actionBy: String,
  staffName:String,
  companyId: String,
  companyName:String,

 

  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
});
module.exports = Logs = mongoose.model('logs', newLogsSchema);
