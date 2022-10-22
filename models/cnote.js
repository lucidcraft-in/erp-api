const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSaleReturnSchema = new Schema({
  // Reference sale invoice number
  refInvoiceNumber: String,

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

module.exports = SaleReturn = mongoose.model('salereturn', newSaleReturnSchema);
