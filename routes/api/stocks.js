const express = require('express');
const router = express.Router();
const Stock = require('../../models/stock');

// get items

router.get('/', async (req, res) => {
    try {
      const stocks = await  Stock.aggregate( [
        {
          $lookup:
            {
              from: "items",
              localField: "itemCode",
              foreignField: "itemCode",
              as: "item_stock"
            }
       }
     ] )

      
      return res.json(stocks);
    } catch (err) {
      return res.json(err);
    }
  });



module.exports = router;