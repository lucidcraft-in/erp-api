const express = require('express');
const router = express.Router();

const SoldItem = require('../../models/soldItem');
const { route } = require('./auth');
const addLog = require('../logs/logs')

//  new solditem

router.post('/create', async (req, res) => {
  try {
    const newSoldItem = SoldItem({
      invoiceId: req.body.invoiceId,
      saleId: req.body.saleId,
      invoiceNumber: req.body.invoiceNumber,
      itemName: req.body.itemName,
      itemId: req.body.itemId,
      mrp: req.body.mrp,
      salesPrice: req.body.salesPrice,
      taxPercentage: req.body.taxPercentage,
      taxAmount: req.body.taxAmount,
      amountBeforTax: req.body.amountBeforTax,
      amountAfterTax: req.body.amountAfterTax,
      discountPercentage: req.body.discountPercentage,
      discountRate: req.body.discountRate,
      quantity: req.body.quantity,
      uom: req.body.uom,
      created: Date.now(),
      status: 1,
    });
    const solditem = await newSoldItem.save();
    if(solditem){
      // Logs
      addLog(req.body.itemName,'DEFAULT_SOLD_ITEM','CREATE')
    }
    return res.status(200).json(solditem);
  } catch (err) {
    return res.json(err);
  }
});

// get sold item

router.get('/soldItems', async (req, res) => {
  try {
    const soldItem = await SoldItem.find({ status: 1 });
    return res.json(soldItem);
  } catch (err) {
    return res.json(err);
  }
});

// get sold item By Date

router.get('/soldItemsDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);

    const soldItem = await SoldItem.find({
      created: { $gt: first, $lt: last },
    });
    return res.json(soldItem);
  } catch (err) {
    return res.json(err);
  }
});

// get sold item By Date and item Name

router.get(
  '/soldItemsDateName/:firstDate/:lastDate/:itemName',
  async (req, res) => {
    try {
      var first = Date.parse(req.params.firstDate);
      var last = Date.parse(req.params.lastDate);

      const soldItem = await SoldItem.find({
        $and: [
          { created: { $gt: first, $lt: last } },
          { itemName: req.params.itemName },
        ],
      });
      return res.json(soldItem);
    } catch (err) {
      return res.json(err);
    }
  }
);

module.exports = router;
