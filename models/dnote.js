const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newPurchaseReturnSchema = new Schema({
  // Reference Purchase invoice number
  refInvoiceNumber: String,

  purchaseId: String,
  invoiceNumber: String,
  invoiceDate: Date,
  invoiceType: String,
  invoiceTypeId: String,

  vendorDetails: {},

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
  purchaseAccountId: String,
  customerAccountId: String,
  paymentAccountId: String,

  customerAccountName: String,
  purchaseAccountName: String,
  paymentAccountName: String,

  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
  status: Number,
});

module.exports = PurchaseReturn = mongoose.model(
  'purchasereturn',
  newPurchaseReturnSchema
);
