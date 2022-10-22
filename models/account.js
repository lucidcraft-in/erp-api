const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAccountSchema = new Schema({
  accountName: String,
  accountType: String,
  category: String,
  balance: Number,
  description: String,
  status: Number,
  type: Number /**other=1 customer=2,staff=3,vendor=4 */,
  referenceId: String /** _id of customer,staff,vendor */,

  // IF payment account
  ifPaymentAccount: Boolean,

  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
});
module.exports = Accounts = mongoose.model('account', newAccountSchema);
