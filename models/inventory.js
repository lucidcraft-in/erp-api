const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSchema = new Schema({
  inventoryId: String,
  inventoryName: String,
  inventoryCode: String,
  place: String,
  phone1: Number,
  phone2: Number,
  adress1: String,
  adress2: String,
  city: String,
  state: String,
  pincode: String,
  defaultCompany: Boolean,
  items: [
    {
      name: String,
      itemCode: String,
      salesRate: Number,
      quantity: Number,
      gstPercentage: Number,
      cess: Number,
    },
  ],

  status: Number,
  // timestamp
  created: Number,
  deleted: Number,
  updated: Number,

  quantity: Number,
  
});

module.exports = Inventory = mongoose.model('inventory', newSchema);
