const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSoldItemSchema = new Schema({
  invoiceId: String,
  saleId: String,
  invoiceNumber: String,
  itemName: String,
  itemId: String,
  mrp: Number,
  salesPrice: Number,
  taxPercentage: Number,
  taxAmount: Number,
  amountBeforTax: Number,
  amountAfterTax: Number,
  discountPercentage: Number,
  discount: Number,
  quantity: Number,
  uom: String,
  created: Number,
  status: Number,
});
module.exports = SoldItem = mongoose.model('soldItem', newSoldItemSchema);
