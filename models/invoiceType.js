const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newInvoiceTypeSchema = new Schema({
  invoiceType: String,
  firstName: String,
  number: Number,
  lastName: String,
  isTax: Boolean,
  cess: Boolean,
  additionalTax: Boolean,
  created: Date,
  updated: Date,
  deleted: Date,
  status: Number,
  type: String,
});
module.exports = invoiceType = mongoose.model(
  'invoiceType',
  newInvoiceTypeSchema
);
