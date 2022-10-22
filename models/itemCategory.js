const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newItemCategorySchema = new Schema({
  name: String,
  image:String,
  
  // timestamp
  created: Number,
  deleted: Number,

  status: Number,
  
});

module.exports = ItemCategory = mongoose.model('itemCategory', newItemCategorySchema);
