const express = require('express');
const router = express.Router();
const SaleReturn = require('../../models/cnote');
const getId = require('../../utils/getId');
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');
const Inventory = require('../../models/inventory');
const addLog = require('../logs/logs')

// gets All sales Return

router.get('/', async (req, res) => {
  try {
    const sales = await SaleReturn.find({ status: 1 });

    return res.status(200).json(sales);
  } catch (err) {
    return res.json(error);
  }
});

// Create
var lastId = 0;
router.post('/create', async (req, res) => {
  try {
    const { saleReturnId } = await getId({ saleReturnId: 1 });
    console.log('saleReturnId');
    // ---------Algorithm-------------------------------

    // 1 . check balance of invoice,
    // 2.   insert sale document
    // 3.   insert transaction as credit => sale and update balance
    // 4.   insert transaction as debit => customer and update balance
    // 5.   update inventory stock
    // 6.   check bill status,
    // 7.   insert transaction as credit => customer and update balance
    // 8.   insert transaction as debit => cash or bank  and update balance
    // 9.   Update series number

    // ---------Algorithm end-----------------------------

    // 1.
    // if its 1, then invoice is full payment and 0 its credited some balance to customer

    if (req.body.balance == 0) {
      billStatus = 1;
    } else {
      billStatus = 0;
    }

    // check ref invoice number is non empty
    if (!req.body.refInvoiceNumber) return;

    // 2.
    const newSale = new SaleReturn({
      saleId: `SLE-RTN-${saleReturnId}`,
      invoiceNumber: req.body.invoiceNumber,
      // Ref invoice Number
      refInvoiceNumber: req.body.refInvoiceNumber,

      invoiceDate: req.body.invoiceDate,
      invoiceTypeId: req.body.invoiceTypeId,

      // customer details as object
      customerDetails: req.body.customerDetails,

      amountBeforeTax: req.body.amountBeforeTax,
      amountAfterTax: req.body.amountAfterTax,

      cgstAmount: req.body.cgstAmount,
      cgstPercentage: req.body.cgstPercentage,
      sgstAmount: req.body.sgstAmount,
      sgstPercentage: req.body.sgstPercentage,
      igstAmount: req.body.igstAmount,
      igstPercentage: req.body.igstPercentage,
      gstAmount: req.body.gstAmount,
      gstPercentage: req.body.gstPercentage,
      discount: req.body.discount,

      items: req.body.item,

      billStatus: billStatus,

      // Insert sale account, customer account , and payment account id for reference to sale edit account
      saleAccountId: req.body.saleAccountId,
      customerAccountId: req.body.customerAccountId,
      paymentAccountId: req.body.paymentAccountId,

      balance: req.body.balance,
      // timestamp
      created: Date.now(),
      status: 1,
    });
    const sale = await newSale.save();
    if(sale){
      // Logs

      addLog(req.body.customerDetails.name,'CREDIT NOTE','CREATE')
    }

    

    // // 3.
    const transactions = await Transaction.findOne({})
    .sort({ _id: -1 })
    .limit(1);
    if (transactions !== null) {
      lastId = transactions.reference + 1;
    } else {
      lastId = 1;
    }
    const newTransactionCreditSale = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.defaultSaleAccountName,
      accountId: req.body.defaultSaleAccountId,
      credit: req.body.amountAfterTax,
      journalRef: req.body.customerAccountId,
      referenceType: 'SALE RETURN',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const saleTransaction = await newTransactionCreditSale.save();

    if (saleTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.defaultSaleAccountId },
        { $inc: { balance: -req.body.amountAfterTax } }
      );
    }

    // 4.
    const newTransactionDebitCustomer = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.customerAccountName,
      accountId: req.body.customerAccountId,
      debit: req.body.amountAfterTax,
      journalRef: req.body.defaultSaleAccountId,
      referenceType: 'SALE RETURN',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const customerTransaction = await newTransactionDebitCustomer.save();

    if (customerTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.customerAccountId },
        { $inc: { balance: req.body.amountAfterTax } }
      );
    }
    // 5.
    var itemsLength = req.body.item.length;

    // iterate with object items
    for (var i = 0; i < itemsLength; i++) {
      // update in stock
      const item = await Inventory.findOneAndUpdate(
        { 'items._id': req.body.item[i].id },
        {
          $inc: {
            'items.$.quantity': req.body.item[i].quantity,
          },
        }
      );
      // console.log(item);
    }
    // 7.
    if (billStatus == 1) {
      const newTransactionCreditSalePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.customerAccountName,
        accountId: req.body.customerAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.defaultPaymentAccountId,
        referenceType: 'SALE RETURN',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });
      const customerTransactionPayment =
        await newTransactionCreditSalePayment.save();
      // console.log(customerTransactionPayment);
      if (customerTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.customerAccountId },
          { $inc: { balance: -req.body.amountAfterTax } }
        );
      }

      // 8.

      const newTransactionDebitSalePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.defaultPaymentAccountName,
        accountId: req.body.defaultPaymentAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.customerAccountId,
        referenceType: 'SALE RETURN',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });

      const saleTransactionPayment =
        await newTransactionDebitSalePayment.save();
      
        if(saleTransactionPayment){
          // Logs
          addLog(req.body.customerDetails,'CNOTE','CREATE')
        }  

      if (saleTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.defaultPaymentAccountId },
          { $inc: { number: 1 } }
        );
      }
    }

    // 9.
    await InvoiceType.findOneAndUpdate(
      { _id: req.body.invoiceTypeId },
      { $inc: { number: 1 } }
    );
  } catch (err) {
    return res.json(err);
  }
});


// Edit sale

router.post('/edit', async (req, res) => {
  try {
    // 1. Get old document id get sale document
    // 2. update account balance
    // 3. Update transaction as inactive
    // 4. Update Inventory Stock
    // 5. update sale document as inactive
    // 6. Insert sale as new

    // ------------------------
    // 1 .

    const invoiceNumber_ = req.body.invoiceNumber;

    const oldSale = await Sale.findOne({
      invoiceNumber: invoiceNumber_,
    });

    const saleId = oldSale.saleId;

    //   2 & 3 .
    const oldTransaction = await Transaction.find({
      referenceType: 'SALE',
      referenceId: invoiceNumber_,
    });

    let balance;
    //  map through old transaction array , and update account balance and inactive all transaction

    for (var i = 0; i < oldTransaction.length; i++) {
      if (oldTransaction[i].credit) {
        balance = oldTransaction[i].credit;

        await Account.findOneAndUpdate(
          { _id: oldTransaction[i].accountId },
          { $inc: { balance: balance } }
        );
      } else {
        balance = oldTransaction[i].debit;

        await Account.findOneAndUpdate(
          { _id: oldTransaction[i].accountId },
          { $inc: { balance: -balance } }
        );
      }

      // update to transaction
      const as = await Transaction.findOneAndUpdate(
        { _id: oldTransaction[i]._id },
        { $set: { status: 0 } }
      );
    }

    // 4.
    var itemsLength = oldSale.items.length;

    // iterate with object items
    for (var j = 0; j < itemsLength; j++) {
      const item = await Item.findByIdAndUpdate(
        {
          _id: req.body.item[j].id,
        },
        { $inc: { quantity: oldSale.items[j].quantity } }
      );

      // update in stock
      // const item = await Inventory.findOneAndUpdate(
      //   { 'items._id': oldSale.items[j].id },
      //   {
      //     $inc: {
      //       'items.$.quantity': oldSale.items[j].quantity,
      //     },
      //   }
      // );
    }

    // 5.
    await Sale.findOneAndUpdate({ _id: oldSale._id }, { $set: { status: 0 } });

    // 6 .1
    if (req.body.balance == 0) {
      billStatus = 1;
    } else {
      billStatus = 0;
    }

    // 6.2
    const newSale = new Sale({
      saleId: saleId,
      invoiceNumber: req.body.invoiceNumber,
      invoiceDate: req.body.invoiceDate,
      invoiceTypeId: req.body.invoiceTypeId,

      // customer details as object
      customerDetails: req.body.customerDetails,

      amountBeforeTax: req.body.amountBeforeTax,
      amountAfterTax: req.body.amountAfterTax,

      cgstAmount: req.body.cgstAmount,
      cgstPercentage: req.body.cgstPercentage,
      sgstAmount: req.body.sgstAmount,
      sgstPercentage: req.body.sgstPercentage,
      igstAmount: req.body.igstAmount,
      igstPercentage: req.body.igstPercentage,
      gstAmount: req.body.gstAmount,
      gstPercentage: req.body.gstPercentage,
      discount: req.body.discount,

      items: req.body.item,

      billStatus: billStatus,

      // Insert sale account, customer account , and payment account id for reference to sale edit account
      saleAccountId: req.body.defaultSaleAccountId,
      customerAccountId: req.body.customerAccountId,
      paymentAccountId: req.body.defaultPaymentAccountId,

      balance: req.body.balance,
      // timestamp
      created: Date.now(),
      status: 1,
    });
    // log update sale....................................... ///
    const updatesale = await newSale.save();
    if(updatesale){
      // Logs

      addLog(req.body.customerDetails.name,'CNOTE','UPDATE')
    }
    // .......................................................

    // 3.
    const transactions = await Transaction.findOne({})
    .sort({ _id: -1 })
    .limit(1);
    if (transactions !== null) {
      lastId = transactions.reference + 1;
    } else {
      lastId = 1;
    }
    const newTransactionCreditSale = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.defaultSaleAccountName,
      accountId: req.body.defaultSaleAccountId,
      credit: req.body.amountAfterTax,
      journalRef: req.body.customerAccountId,
      referenceType: 'SALE',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const saleTransaction = await newTransactionCreditSale.save();

    if (saleTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.defaultSaleAccountId },
        { $inc: { balance: -req.body.amountAfterTax } }
      );
    }

    // 4.
    const newTransactionDebitCustomer = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.customerAccountName,
      accountId: req.body.customerAccountId,
      debit: req.body.amountAfterTax,
      journalRef: req.body.defaultSaleAccountId,
      referenceType: 'SALE',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const customerTransaction = await newTransactionDebitCustomer.save();

    if (customerTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.customerAccountId },
        { $inc: { balance: req.body.amountAfterTax } }
      );
    }

    // 5.
    var itemsLength = req.body.item.length;

    // iterate with object items
    for (var i = 0; i < itemsLength; i++) {
      // update in stock
      const item = await Item.findByIdAndUpdate(
        {
          _id: req.body.item[i].id,
        },
        { $inc: { quantity: -req.body.item[i].quantity } }
      );

      // const item = await Inventory.findOneAndUpdate(
      //   { 'items._id': req.body.item[i].id },
      //   {
      //     $inc: {
      //       'items.$.quantity': -req.body.item[i].quantity,
      //     },
      //   }
      // );
      // console.log(item);
    }

    // 7.
    if (billStatus == 1) {
      const newTransactionCreditSalePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.customerAccountName,
        accountId: req.body.customerAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.defaultPaymentAccountId,
        referenceType: 'SALE',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });
      const customerTransactionPayment =
        await newTransactionCreditSalePayment.save();
      console.log(customerTransactionPayment);
      if (customerTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.customerAccountId },
          { $inc: { balance: -req.body.amountAfterTax } }
        );
      }

      // 8.

      const newTransactionDebitSalePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.defaultPaymentAccountName,
        accountId: req.body.defaultPaymentAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.customerAccountId,
        referenceType: 'SALE',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });

      const saleTransactionPayment =
        await newTransactionDebitSalePayment.save();

      if (saleTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.InvoiceType },
          { $inc: { number: 1 } }
        );
      }
    }

    // 9.
    await InvoiceType.findOneAndUpdate(
      { _id: req.body.invoiceTypeId },
      { $inc: { number: 1 } }
    );
    console.log(req.body);
  } catch (err) {
    return res.json(err);
  }
});

// get sales return by date
router.get('/salesByDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);
    const sales = await SaleReturn.find({ created: { $gt: first, $lt: last } });
    return res.json(sales);
  } catch (err) {
    return res.json(err);
  }
});

// Delete  sale return
router.post('/delete/:id', async (req, res) => {
  try {
    // Get deleted sale invoice number
    const invoiceNumber = req.params.id;
    // 1. Get old document id get sale document
    // 2. update account balance
    // 3. Update transaction as inactive
    // 4. Update Inventory Stock
    // 5. update sale document as inactive

    console.log(invoiceNumber);
    //  1.
    const oldSaleReturn = await SaleReturn.findOne({
      invoiceNumber: invoiceNumber,
    });

    //   2 & 3 .
    const oldTransaction = await Transaction.find({
      referenceType: 'SALE RETURN',
      referenceId: invoiceNumber,
    });

    //  map through old transaction array , and update account balance and inactive all transaction

    for (var i = 0; i < oldTransaction.length; i++) {
      if (oldTransaction[i].credit) {
        balance = oldTransaction[i].credit;

        await Account.findOneAndUpdate(
          { _id: oldTransaction[i].accountId },
          { $inc: { balance: balance } }
        );
      } else {
        balance = oldTransaction[i].debit;

        await Account.findOneAndUpdate(
          { _id: oldTransaction[i].accountId },
          { $inc: { balance: -balance } }
        );
      }
      // update to transaction
      const as = await Transaction.findOneAndUpdate(
        { _id: oldTransaction[i]._id },
        { $set: { status: 0 } }
      );
    }

    // 4.
    var itemsLength = oldSaleReturn.items.length;

    // iterate with object items
    for (var j = 0; j < itemsLength; j++) {
      // update in stock
      const item = await Inventory.findOneAndUpdate(
        { 'items._id': oldSaleReturn.items[j].id },
        {
          $inc: {
            'items.$.quantity': oldSaleReturn.items[j].quantity,
          },
        }
      );
    }

    // 5.
    await SaleReturn.findOneAndUpdate(
      { _id: oldSaleReturn._id },
      { $set: { status: 0 } }
    );
    if(saleTransactionPayment){
      // Logs
      addLog(req.body.customerDetails,'CNOTE','DELETE')
    }  
  } catch (error) {
    return res.json(error);
  }
});
module.exports = router;
