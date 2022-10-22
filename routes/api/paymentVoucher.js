const express = require('express');
const router = express.Router();
const Account = require('../../models/account');
const Transaction = require('../../models/transaction')


  // gets Payment

  router.get('/payments', async (req, res) => {
    try {
      const account = await Transaction.find({ status: 1, transactionType: 1 });
      return res.json(account);
    } catch (err) {
      return res.json(err);
    }
  });


  
// create payment voucher

router.post('/create', async (req, res) => {
    try {
      const newAccount = Transaction({
        transactionType: 1,
        date: new Date(req.body.date).getTime(),
        accountName: req.body.accountName,
        description: req.body.description,
        balance: req.body.balance,
        accountId:req.body.accountId,

        status: 1,
        
        created: Date.now(),
      });
      const account = await newAccount.save();
      console.log(account)
      if(account){
        // Logs
        addLog(req.body.accountName,'PAYMENT VOUCHER','CREATE')
      }
  
      return res.status(200).json(account);
    } catch (err) {
      return res.json(err);
    }
  });
  // getByDate
  router.get('/paymentVoucherBydate/:firstDate/:lastDate', async (req, res) => {
    try {
      var first = Date.parse(req.params.firstDate);
      var last = Date.parse(req.params.lastDate);
      const paymentVoucher = await Transaction.find({
        created: { $gt: first, $lt: last },
      });
      return res.json(paymentVoucher);
    } catch (err) {
      return res.json(err);
    }
  });
//   
// update
router.post('/update/:id', async (req, res) => {
    try {
      const account = await Transaction.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            date: new Date(req.body.date).getTime(),
        accountName: req.body.accountName,
        description: req.body.description,
        accountId:req.body.accountId,
        debit: req.body.balance,
        
        status: 1,
        
        created: Date.now(),
          },
        }
      );
      if(account){
        addLog(req.body.name,'PAYMENT VOUCHER','UPDATE')
      }
      return res.status(200).json(account);
    } catch (err) {
      return res.json(err);
    }
  });
  // view single payment voucher
router.get('/getById/:id', async (req, res) => {
    try {
      const voucher = await Transaction.findOne({ _id: req.params.id });
      return res.json(voucher);
    } catch (err) {
      return res.json(err);
    }
  });

  module.exports = router;