const express = require('express');
const router = express.Router();
const Setting = require('../../models/setting');

async function initSettings(req, res) {
  try {
    const newSetting = new Setting({
      entityId: 100,
      purchaseId: 200,
      saleId: 300,
      saleReturnId: 100,
      purchaseReturnId: 100,
      itemId: 600,
      transactionId: 400,
      seriesName: '',

      // default
      defaultCustomer: '',
      defaultVendor: '',
      defaultSalesAccound: '',
      defaultPurchaseAccount: '',
      defaultPaymentAccount: '',
      defaultSaleReturnAccount: '',
      status: 1,
    });
    const setting = await newSetting.save();
    // return res.json(setting);
  } catch (err) {
    return res.json(err);
  }
}

module.exports.initSettings = initSettings;
