const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newEntitySchema = new Schema({
  name: String,
  entityId: { type: String, index: true },

  type_: Number,
  //   Type : Admin =>0 , Staff =>1 , Customer =>2, Vendor =>3
  role: String,

  email: String,
  password: String,

  //Phones:
  phone1: Number,
  phone2: Number,

  //Address:
  address1: String,
  address2: String,
  place: String,
  city: String,
  district: String,
  state: String,
  stateCode: Number,
  country: String,
  pincode: String,
  
  //Salary:
  commision: String,
  salaryAmount: String,

  //Tax and bank
  gstIn: String,
  tn: String,
  bankName: String,
  bankAddress: String,
  accountNo: String,
  ifscCode: String,
  balance: Number,
  maximumCreditAmount: Number,
  // pricing
  salePrice: Number,

  //Timestamps
  created: Number,
  deleted: Number,
  updated: Number,
  status: Number,
});

module.exports = Entity = mongoose.model('entity', newEntitySchema);
