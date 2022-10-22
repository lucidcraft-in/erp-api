const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newTransactionSchema = new Schema({
  date: Number,
  accountName: String,
  accountName2: String,
  accountId: String,
  accountId2: String,
  debit: Number,
  credit: Number,
  description: String,
  attachment: String,
  reference: Number,
  status: Number,
  journalRef: String,
  
// transaction type 0=>receipt voucher   1=> payment voucher
transactionType: Number,

  //referenceId for [invoice number]
  referenceType: String,
  referenceId: String,

  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,
});
module.exports = Transactions = mongoose.model(
  'transaction',
  newTransactionSchema
);
