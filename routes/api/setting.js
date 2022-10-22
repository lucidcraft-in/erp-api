const express = require('express');
const router = express.Router();
const Setting = require('../../models/setting');
const addLog = require('../logs/logs')

//initialise the ids
router.initSettings =
  ('/init',
  async (req, res) => {
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
        defaultPurchaseReturnAccountId: '',
        status: 1,
      });
      const setting = await newSetting.save();
      return res.json(setting);
    } catch (err) {
      return res.json(err);
    }
  });

// gets

router.get('/settings', async (req, res) => {
  try {
    const settings = await Setting.findOne({ status: 1 });
    return res.status(200).json(settings);
  } catch (err) {
    return res.json(error);
  }
});

//  get
router.get('/settings/:id', async (req, res) => {
  try {
    const settings = await Setting.findOne({ _id: req.params.id });
    return res.json(settings);
  } catch (err) {
    return res.json(err);
  }
});

// update seriesName

router.post('/updateSeries', async (req, res) => {
  console.log(req.body, req.params.id);
  try {
    const settings = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          seriesName: req.body.seriesName,
        },
      },
      { new: true }
    );
    if(settings){
      // Logs
      addLog(req.body.seriesName,'SERIESNAME','UPDATE')
    }
    return res.status(200).json(settings);
  } catch (err) {
    return res.json(err);
  }
});

// Update Default customer in sale
router.post(`/update/default/sale`, async (req, res) => {
  console.log(req.body.customer);
  try {
    const setting = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          defaultCustomer: req.body.customer,
          defaultSalesAccound: req.body.saleAccount,
        },
      },
      { new: true }
    );
    if(setting){
      // Logs
      addLog(req.body.customer,'DEFAULT_SALE_SETTINGS','UPDATE')
    }
    return res.status(200).json(setting);
  } catch (err) {
    return res.json(err);
  }


});

// // Update Default sale accounts in sale
// router.post(`/updateDefaultSaleAccount`, async (req, res) => {
//   console.log(req.body.account);
//   try {
//     const setting = await Setting.findOneAndUpdate(
//       { status: 1 },
//       {
//         $set: {
//           defaultSalesAccound: req.body.account,
//         },
//       },
//       { new: true }
//     );
//     return res.status(200).json(setting);
//   } catch (err) {
//     return res.json(err);
//   }
// });

// Update Default payment accounts in sale
router.post(`/update/default/payment/account`, async (req, res) => {
  console.log(req.body.accounts);
  try {
    const setting = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          defaultPaymentAccount: req.body.accounts,
        },
      },
      { new: true }
    );
    if(setting){
      // Logs
      addLog(req.body.accounts,'DEFAULT_ACCOUNT','UPDATE')
    }
    return res.status(200).json(setting);
  } catch (err) {
    return res.json(err);
  }
});

// Update Default customer in sale
router.post(`/update/default/purchase`, async (req, res) => {
  console.log(req.body.purchaseAccount);
  try {
    const setting = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          defaultVendor: req.body.defaultVendor,
          defaultPurchaseAccount: req.body.purchaseAccount,
        },
      },
      { new: true }
    );
    if(setting){
      // Logs
      addLog(req.body.defaultVendor,'DEFAULT_PURCHASE_SETTINGS','UPDATE')
    }
    return res.status(200).json(setting);
  } catch (err) {
    return res.json(err);
  }
});

// Update Default sale return account id
router.post(`/update/default/sale-return`, async (req, res) => {
  try {
    console.log(req.body.defaultSaleReturnAccount);
    const setting = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          defaultSaleReturnAccount: req.body.defaultSaleReturnAccount,
        },
      },
      { new: true }
    );
    if(setting){
      // Logs
      addLog(req.body.defaultSaleReturnAccount,'DEFAULT_SALE_RETURN','UPDATE')
    }
    return res.status(200).json(setting);
  } catch (err) {
    return res.json(err);
  }
});

// Update Default sale return account id
router.post(`/update/default/purchase-return`, async (req, res) => {
  try {
    console.log(req.body.purchaseReturnAccount);
    const setting = await Setting.findOneAndUpdate(
      { status: 1 },
      {
        $set: {
          defaultPurchaseReturnAccount: req.body.purchaseReturnAccount,
        },
      },
      { new: true }
    );
    if(setting){
      // Logs
      addLog(req.body.purchaseReturnAccount,'DEFAULT_SALE_RETURN','UPDATE')
    }
    return res.status(200).json(setting);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
