const express = require('express');
const router = express.Router();

const PurchaseItem = require('../../models/purchaseItem');
const addLog = require('../logs/logs')

// new purchase item

router.post('/create', async (req, res) => {
  try {
    const newPurchaseItem = PurchaseItem({
      invoiceId: req.body.invoiceId,
      purchaseId: req.body.purchaseId,
      invoiceNumber: req.body.invoiceNumber,
      itemName: req.body.itemName,
      itemId: req.body.itemId,
      mrp: req.body.mrp,
      purchasePrice: req.body.purchasePrice,
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
    const purchaseItem = await newPurchaseItem.save();
    if(purchaseItem){
      // Logs
      addLog(req.body.itemName,'ITEM','CREATE')
    }
    return res.status(200).json(purchaseItem);
  } catch (err) {
    return res.json(err);
  }
});

// get purchase item

router.get('/purchaseItems', async (req, res) => {
  try {
    const purchaseItem = await PurchaseItem.find({ status: 1 });
    return res.json(purchaseItem);
  } catch (err) {
    return res.json(err);
  }
});

// get purchase item By Date

router.get('/purchaseItemsDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);

    const purchaseItem = await PurchaseItem.find({
      created: { $gt: first, $lt: last },
    });
    return res.json(purchaseItem);
  } catch (err) {
    return res.json(err);
  }
});

// get purchase item By Date and item Name

router.get(
  '/purchaseItemsDateName/:firstDate/:lastDate/:itemName',
  async (req, res) => {
    try {
      var first = Date.parse(req.params.firstDate);
      var last = Date.parse(req.params.lastDate);

      const purchaseItem = await PurchaseItem.find({
        $and: [
          { created: { $gt: first, $lt: last } },
          { itemName: req.params.itemName },
        ],
      });
      return res.json(purchaseItem);
    } catch (err) {
      return res.json(err);
    }
  }
);

module.exports = router;
