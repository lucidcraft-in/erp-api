const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newPurchaseItemSchema = new Schema({
  invoiceId: String,
  purchaseId: String,
  invoiceNumber: String,
  itemName: String,
  itemId: String,
  mrp: Number,
  purchasePrice: Number,
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

module.exports = PurchaseItem = mongoose.model(
  'purchaseItem',
  newPurchaseItemSchema
);
