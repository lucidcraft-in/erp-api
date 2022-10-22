const express = require('express');
const router = express.Router();
const Account = require('../../models/account');
const Setting = require('../../models/setting');
const addLog = require('../logs/logs')

// add account

router.post('/create', async (req, res) => {
  try {
    const newAccount = Account({
      accountName: req.body.accountName,
      accountType: req.body.accountType,
      category: req.body.category,
      balance: req.body.balance,
      description: req.body.description,
      status: 1,
      type: 1,
      referenceId: req.body.referenceId,
      ifPaymentAccount: req.body.ifPaymentAccount,
      // timestamp
      created: Date.now(),
    });
    const account = await newAccount.save();
    
    if(account){
      // Logs
      addLog(req.body.accountName,'ACCOUNT','CREATE')
    }
    
    // Check payment account is empty in db , update as default payment account id to settings
    if (req.body.ifPaymentAccount === true) {
      const account = await Account.find({ ifPaymentAccount: true });

      if (account.length == 1) {
        // update account to settings

        const setting = await Setting.findOneAndUpdate(
          { status: 1 },
          {
            $set: {
              defaultPaymentAccount: account[0]._id,
            },
          },
          { new: true }
        );
      }
    }
 


    return res.status(200).json(account);
  } catch (err) {
    return res.json(err);
  }
});

// gets

router.get('/accounts', async (req, res) => {
  try {
    const account = await Account.find({ status: 1 });
    return res.json(account);
  } catch (err) {
    return res.json(err);
  }
});

//  get single account

router.get('/getById/:id', async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id });
    return res.json(account);
  } catch (err) {
    return res.json(err);
  }
});

// update account

router.post('/update/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          accountName: req.body.accountName,
          types: req.body.accountType,
          category: req.body.category,
          balance: req.body.balance,
          description: req.body.description,
          status: 1,
          type: 1,
          referenceId: req.body.referenceId,
          // timestamp
          updateds: Date.now(),
        },
      }
    );
    if(account){
      // Logs
      addLog(req.body.accountName,'ACCOUNT','UPDATE')
    }
    
    return res.status(200).json(account);

  } catch (err) {
    return res.json(err);
  }
});

// Delete Accounts
router.post(`/delete/:id`, async (req, res) => {
  try {
    const accountID = await Account.findById({ _id: req.params.id });
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 0, deleted: Date.now() } }
      // { new: true }
    );
    if(account){
      // Logs
      addLog(accountID.accountName,'ACCOUNT','DELETE')
    }
    return res.json(true);
  } catch (err) {
    return res.json(err);
  }
});

// Get account of cusomer , staff, and vendor
router.get(`/account/forselect`, async (req, res) => {
  try {
    const customer = await Account.find({
      status: 1,
      $or: [{ type: 2 }, { type: 3 }, { type: 4 }],
    });
    return res.json(customer);
  } catch (err) {
    return res.json(err);
  }
});

// get payment accounts  only
router.get(`/accounts/payment`, async (req, res) => {
  try {
     
    const accounts = await Account.find({
      ifPaymentAccount: true,
      status: 1,
    });
   
    return res.json(accounts);
  } catch (err) {
    return res.json(err);
  }
});

// Get account transactions

router.get('/transaction/all', async (req, res) => {
  try {
    const accounts = await Account.find({ status: 1 });
    return res.json(accounts);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
