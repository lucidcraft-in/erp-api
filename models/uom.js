const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newUomSchema = new Schema({
  uomName: String,
  quantity: Number,
  created: Number,
  updated: Number,
  deleted: Number,
  status: Number,
});
module.exports = uom = mongoose.model('uom', newUomSchema);
