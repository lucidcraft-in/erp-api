const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAccountSchema = new Schema({
    itemId: String,
    inventoryId: String,
    barcode: String,
    batchName: String,
    quantity: Number,
    itemCode: String,
    purchaseRate:Number,
 

  // timestamp
    created: Number,
    deleted: Number,
    updated: Number,
});
module.exports = Stock = mongoose.model('stock', newAccountSchema);

