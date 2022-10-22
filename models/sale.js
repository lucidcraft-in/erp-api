const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSaleSchema = new Schema({
  saleId: String,
  invoiceNumber: String,
  invoiceDate: Date,
  invoiceType: String,
  invoiceTypeId: String,

  customerDetails: {},

  amountBeforeTax: Number,
  amountAfterTax: Number,

  cgstAmount: Number,
  cgstPercentage: Number,
  sgstAmount: Number,
  sgstPercentage: Number,
  igstAmount: Number,
  igstPercentage: Number,
  gstAmount: Number,
  gstPercentage: Number,
  discount: Number,

  items: [],

  // billing status ,  1- Full payment, 0 - Credit
  billStatus: Number,
  balance: Number,

  // Account id's for managing accounts balance
  saleAccountId: String,
  customerAccountId: String,
  paymentAccountId: String,

  customerAccountName: String,
  SaleAccountName: String,
  PaymentAccountName: String,

  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
  status: Number,
});

module.exports = Sale = mongoose.model('sale', newSaleSchema);
