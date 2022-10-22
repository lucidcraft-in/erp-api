const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newItemSchema = new Schema({
  name: String,
  //   mfgDate: Date,
  //   expDate: Date,
  image:String,
  company: String,
  hsnCode: String,
  mrp: Number,
  purchaseRate: Number,
  salesRate: Number,
  salesRate2: Number,
  salesRate3: Number,
  salesRate4: Number,
  salesRate5: Number,
  gstPercentage: Number,
  cgstPercentage: Number,
  igstPercentage: Number,
  sgstPercentage: Number,
  minimumQuantity: Number,
  cess: Number,
  itemCode: String,
  uom: String,
  description: String,
  image: String,
  group: String,
// Item category
  itemCategory : String,
  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
  status: Number,
  packing: String,
  otherLanguage: String,
  constCenter: String,
  wholeSaleRate: Number,
  packUnit: String,
  addition: Number,

  quantity: Number,
});

module.exports = Items = mongoose.model('item', newItemSchema);
