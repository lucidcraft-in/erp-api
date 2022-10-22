const express = require('express');
const addLog = require('../logs/logs')
const router = express.Router();
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');
const Enttity = require('../../models/entity');

//  function for lst inserted refno

function refNo() {}

// Add Transactionss
var lastId = 0;
router.post('/create', async (req, res) => {
  try {
    const transactions = await Transaction.findOne({})
      .sort({ _id: -1 })
      .limit(1);

    // return res.json(transactions);
    if (transactions !== null) {
      lastId = transactions.reference + 1;
    } else {
      lastId = 1;
    }
    const newTransactionDredit = Transaction({
      date: new Date(req.body.date).getTime(),
      accountName: req.body.accountName,
      debit: req.body.balance,
      reference: lastId,
      description: req.body.description,
      accountId: req.body.accountId,
      journalRef: req.body.accountId2,
      referenceType:req.body.referenceType,
      // attachment: imageUrl,
      status: 1,
      // timestamp
      created: Date.now(),
    });
    const transactionD = await newTransactionDredit.save();
    

    // Decrement account balance when credit
    if (transactionD) {
      await Account.findOneAndUpdate(
        { _id: req.body.accountId },
        {
          $inc: { balance: -req.body.balance },
        }
      );
    }
    const newTransactionCredit = Transaction({
      date: new Date(req.body.date),

      accountName: req.body.accountName2,

      credit: req.body.balance,
      accountId: req.body.accountId2,
      reference: lastId,
      journalRef: req.body.accountId,
      referenceType:req.body.referenceType,
      // attachment: imageUrl,
      status: 1,
      // timestamp
      created: Date.now(),
    });
    const transactionC = await newTransactionCredit.save();

    // Increment account balance when credit
    if (transactionC) {
      await Account.findOneAndUpdate(
        { _id: req.body.accountId2 },
        {
          $inc: { balance: req.body.balance },
        }
      );
    }

    // Update customer  balance
    if (req.body.frontend === 'payment') {
      await Enttity.findOneAndUpdate(
        { _id: req.body.accountId },
        {
          $set: {
            $inc: { balance: req.body.balance },
          },
        }
      );
    }
    if (req.body.frontend === 'recieve') {
      await Enttity.findOneAndUpdate(
        { _id: req.body.accountId },
        {
          $set: {
            $inc: { balance: -req.body.balance },
          },
        }
      );
    }
    if(transactionD){
      addLog(req.body.name,'STAFF','CREATE')
    }
    return res.status(200).json(transactionD);
  } catch (err) {
    return res.json(err);
  }
});

// gets

router.get('/transactions', async (req, res) => {
  try {
    const transaction = await Transaction.find({ status: 1 }).sort({date:-1});
    return res.json(transaction);
  } catch (err) {
    return res.json(err);
  }
});
// get last inserted id
router.get('/lastInsertedId', async (req, res) => {
  try {
    const transaction = await Transaction.find({}).sort({ _id: -1 }).limit(1);
    return res.json(transaction);
  } catch (err) {
    return res.json(err);
  }
});

// get by reference No
router.get('/getByReference/:reference', async (req, res) => {
  try {
    const transaction = await Transaction.find({
      reference: req.params.reference,
    });
    return res.json(transaction);
  } catch (err) {
    return res.json(err);
  }
});

// get single

router.get('/getById/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id });
    return res.json(transaction);
  } catch (err) {
    return res.json(err);
  }
});

// update
router.post('/update/:debitId/:creditId', async (req, res) => {
  // const imageUrl = req.file.fieldname + '-' + Date.now();
  console.log('this in' + req.params.debitId);
  try {
    const debitTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.debitId },
      {
        $set: {
          date: req.body.date,
          accountName: req.body.accountName,
          debit: req.body.debit,
          accountId: req.body.accountId,
          description: req.body.description,
          reference: req.body.reference,
          journalRef: req.body.accountId2,

          status: 1,
          // timestamp
          updated: Date.now(),
        },
      }
    );
    const creditTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.creditId },
      {
        $set: {
          date: req.body.date,

          accountType: req.body.accountName2,

          credit: req.body.credit,
          accountId2: req.body.accountId2,
          reference: req.body.reference,
          journalRef: req.body.accountId,
          // attachment: imageUrl,
          status: 1,

          // timestamp
          updated: Date.now(),
        },
      }
    );
    if(creditTransaction){
      addLog(req.body.name,'TRANSACTION','UPDATE')
    }
    return res.status(200).json(creditTransaction);
  } catch (err) {
    return res.json(err);
  }
});

// delete
router.delete('/delete/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndRemove({
      reference: req.params.reference,
    });
    if(transaction){
      addLog(req.body.name,'TRANSACTION','DELETE')
    }
    return transaction.status(204);
  } catch (err) {
    return res.json(err);
  }
});

// getby account id
router.get(
  '/getByAccId/:accountTypeId/:firstDate/:lastDate',
  async (req, res) => {
    try {
      var first = Date.parse(req.params.firstDate);
      var last = Date.parse(req.params.lastDate);
      const transactions = await Transaction.find({
        $and: [
          { created: { $gt: first, $lt: last } },
          { journalRef: req.params.accountId },
        ],
      });

      return res.json(transactions);
    } catch (err) {
      return res.json(err);
    }
  }
);

router.get('/getByJournalRef/:journalRef', async (req, res) => {
  try {
    const transaction = await Transaction.find({ journalRef: req.params.journalRef });
    return res.json(transaction);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
