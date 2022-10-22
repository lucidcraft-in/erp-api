const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newAccountSchema = new Schema({
    id: String,
    date: Date,
    OpeningStock: String,
    closingStock: String,
    
 

  // timestamp
//   created: Number,
//   deleted: Number,
//   updated: Number,
});
module.exports = DailyStock = mongoose.model('dailyStock', newAccountSchema);

