const express = require('express');
const router = express.Router();
const getId = require('../../utils/getId');
const Sale = require('../../models/sale');
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');
const Item = require('../../models/item');
const InvoiceType = require('../../models/invoiceType');
const addLog = require('../logs/logs')
const Stock = require('../../models/stock');

// get lastid
router.get('/getlastid', async (req, res) => {
  try {
    const getId = await Sales.find().sort({ _id: -1 }).limit(1);
    return res.json(getId[0].saleId);
  } catch (err) {}
});

// gets All sales


router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({ status: 1 });
    return res.status(200).json(sales);
  } catch (err) {
    return res.json(error);
  }
});

// new sales

var lastId = 0;
router.post('/create', async (req, res) => {
  try {
    const { saleId } = await getId({ saleId: 1 });

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
    

    // 2.
    const newSale = new Sale({
      saleId: `SLE-${saleId}`,
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

      addLog(req.body.customerDetails.name,'SALE','CREATE')
    }

    // 3.
    // get last inserted row of transaction for get last refno
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
      reference: lastId,
      accountId: req.body.defaultSaleAccountId,
      credit: req.body.amountAfterTax,
      journalRef: req.body.customerAccountId,
      referenceType: 'SALE',
      referenceId: req.body.invoiceNumber,
      status: 1,
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
      reference: lastId,
      referenceId: req.body.invoiceNumber,
      status: 1,
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
      
      if (req.body.item[i].empty === false) {
        
      const item = await Stock.findOneAndUpdate(
        {
          batchName: req.body.item[i].batchName,
        },
        { $inc: { quantity: -req.body.item[i].quantity } }
      );
         
      }

     
       
    }

    // 7.
    if (billStatus == 1) {
      const newTransactionCreditSalePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.customerAccountName,
        accountId: req.body.customerAccountId,
        credit: req.body.amountAfterTax,
        reference: lastId,
        journalRef: req.body.defaultPaymentAccountId,
        referenceType: 'SALE',
        referenceId: req.body.invoiceNumber,
        status: 1,
      });
      const customerTransactionPayment =
        await newTransactionCreditSalePayment.save();
      
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
        reference: lastId,
        referenceId: req.body.invoiceNumber,
        status: 1,
      });

      const saleTransactionPayment =
        await newTransactionDebitSalePayment.save();

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
    return res.status(200).json(sale);
  } catch (err) {
    return res.json(err);
  }
});

// Get Sales
router.get('/saleids/:id', async (req, res) => {
  
  try {
    const sales = await Sale.findOne({ _id: req.params.id });
    // console.log(sales);
    return res.json(sales);
  } catch (err) {
    return res.json(err);
  }
});

// get sales by date
router.get('/salesByDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);
    const sales = await Sale.find({
      created: { $gt: first, $lt: last },
      status: 1,
    });
    return res.json(sales);
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
     

      
      if (oldSale.items[j].empty === false) {
             let batch =
               oldSale.items[j].itemCode + '_' + oldSale.items[j].purchaseRate;
        
        
        
        const item = await Stock.findOneAndUpdate(
          {
            batchName: batch,
          },
          { $inc: { quantity: oldSale.items[j].quantity } }
        );
      }

      
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

      addLog(req.body.customerDetails.name,'SALE','UPDATE')
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
      reference: lastId,
      referenceId: req.body.invoiceNumber,
      status: 1,
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
      reference: lastId,
      referenceId: req.body.invoiceNumber,
      status: 1,
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
     
      if (req.body.item[i].empty === false) {
        const item = await Stock.findOneAndUpdate(
          {
            batchName: req.body.item[i].batchName,
          },
          { $inc: { quantity: -req.body.item[i].quantity } }
        );
      }

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
        reference: lastId,
        status: 1,
      });
      const customerTransactionPayment =
        await newTransactionCreditSalePayment.save();
      
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
        reference: lastId,
        status: 1,
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
     
return res.json({ message: 'success', statusCode: 200 });
      
  } catch (err) {
    return res.json(err);
  }
});

/**
  
 */
router.post('/delete/:id', async (req, res) => {
  try {
   const DelSale =  await Sale.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 0, deleted: Date.now() } }
    );
    if(DelSale){
      // Logs

      addLog(req.body.customerDetails.name,'SALE','DELETE')
    }
    return res.json(true);
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});
module.exports = router;
