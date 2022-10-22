const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSchema = new Schema({
  entityId: Number,
  purchaseId: Number,
  saleId: Number,
  saleReturnId: Number,
  purchaseReturnId: Number,
  transactionId: Number,
  seriesName: String,
  defaultCustomer: String,
  defaultVendor: String,
  defaultSalesAccound: String,
  defaultPurchaseAccount: String,
  defaultPaymentAccount: String,
  // Default sale ,purchase return
  defaultSaleReturnAccount: String,
  defaultPurchaseReturnAccount: String,

  status: Number,
});

module.exports = Setting = mongoose.model('setting', newSchema);
