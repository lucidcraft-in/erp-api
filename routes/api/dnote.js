const express = require('express');
const router = express.Router();
const PurchaseReturn = require('../../models/dnote');
const getId = require('../../utils/getId');
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');
const Inventory = require('../../models/inventory');
const addLog = require('../logs/logs')


// gets All PURCHASE Return

router.get('/', async (req, res) => {
  try {
    const purchase = await PurchaseReturn.find({ status: 1 });

    return res.status(200).json(purchase);
  } catch (err) {
    return res.json(error);
  }
});

// Create

var lastId = 0;
router.post('/create', async (req, res) => {
  try {
    const { purchaseReturnId } = await getId({ purchaseReturnId: 1 });

    // ---------Algorithm-------------------------------

    // 1 . check balance of invoice,
    // 2.   insert purchase document
    // 3.   insert transaction as credit => purchase and update balance
    // 4.   insert transaction as debit => customer and update balance
    // 5.   update inventory stock
    // 6.   check bill status,
    // 7.   insert transaction as credit => customer and update balance
    // 8.   insert transaction as debit => cash or bank  and update balance
    // 9.   Update series number

    // ---------Algorithm end-----------------------------
    
    if (req.body.balance == 0) {
      billStatus = 1;
    } else {
      billStatus = 0;
    }

    // check ref invoice number is non empty
    if (!req.body.refInvoiceNumber) return;

    // 2.
    const newPurchase = new PurchaseReturn({
      purchaseId: `PUR-RTN-${purchaseReturnId}`,
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

      // Insert purchase account, customer account , and payment account id for reference to purchase edit account
      AccountId: req.body.purchaseAccountId,
      customerAccountId: req.body.customerAccountId,
      paymentAccountId: req.body.paymentAccountId,

      balance: req.body.balance,
      // timestamp
      created: Date.now(),
      status: 1,
    });
    const purchase = await newPurchase.save();
    if(purchase){
      // Logs

      addLog(req.body.vendorDetails.name,'DEBIT NOTE','CREATE')
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
    const newTransactionCreditPurchase = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.defaultAccountName,
      accountId: req.body.defaultPurchaseAccountId,
      credit: req.body.amountAfterTax,
      journalRef: req.body.customerAccountId,
      referenceType: 'PURCHASE RETURN',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const purchaseTransaction = await newTransactionCreditPurchase.save();

    if (purchaseTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.defaultPurchaseAccountId },
        { $inc: { balance: req.body.amountAfterTax } }
      );
    }

    // 4.
    const newTransactionDebitCustomer = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.customerAccountName,
      accountId: req.body.customerAccountId,
      debit: req.body.amountAfterTax,
      journalRef: req.body.defaultPurchaseAccountId,
      referenceType: 'PURCHASE RETURN',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const customerTransaction = await newTransactionDebitCustomer.save();

    if (customerTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.customerAccountId },
        { $inc: { balance: -req.body.amountAfterTax } }
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
            'items.$.quantity': -req.body.item[i].quantity,
          },
        }
      );
      // console.log(item);
    }

    // 7.
    if (billStatus == 1) {
      const newTransactionCreditPurchasePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.customerAccountName,
        accountId: req.body.customerAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.defaultPaymentAccountId,
        referenceType: 'PURCHASE RETURN',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });
      const customerTransactionPayment =
        await newTransactionCreditPurchasePayment.save();
      // console.log(customerTransactionPayment);
      if (customerTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.customerAccountId },
          { $inc: { balance: -req.body.amountAfterTax } }
        );
      }

      // 8.

      const newTransactionDebitPurchasePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.defaultPaymentAccountName,
        accountId: req.body.defaultPaymentAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.customerAccountId,
        referenceType: 'PURCHASE RETURN',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });

      const purchaseTransactionPayment =
        await newTransactionDebitPurchasePayment.save();

      if (purchaseTransactionPayment) {
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
    if(purchaseReturnId){
      // Logs
      addLog(req.body.customerDetails,'DNOTE','CREATE')
    }
  } catch (error) {
    return res.json(error);
  }
});

// edit purchase

router.post('/edit', async (req, res) => {
  try {
    // 1. Get old document id get purchase document
    // 2. update account balance
    // 3. Update transaction as inactive
    // 4. Update Inventory Stock
    // 5. update purchase document as inactive
    // 6. Insert purchase as new

    // ------------------------
    // 1 .

    const invoiceNumber_ = req.body.invoiceNumber;

    const oldPurchase = await Purchase.findOne({
      invoiceNumber: invoiceNumber_,
    });

    const purchaseId = oldPurchase.purchaseId;

    // 2 & 3 .
    const oldTransaction = await Transaction.find({
      referenceType: 'PURCHASE',
      referenceId: invoiceNumber_,
    });

    let balance;
    // //  map through old transaction array , and update account balance and inactive all transaction

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

    // // 4.
    var itemsLength = oldPurchase.items.length;

    // iterate with object items
    for (var j = 0; j < itemsLength; j++) {
      // update in stock
    
      const item = await Stock.findByIdAndUpdate(
        {
          batchName:  oldPurchase.items[j].batchName,
        },
        { $dec: { quantity: oldPurchase.items[j].quantity } }
      );
    }

    // // 5.
    await Purchase.findOneAndUpdate(
      { _id: oldPurchase._id },
      { $set: { status: 0 } }
    );

    // // 6 .1
    if (req.body.balance == 0) {
      billStatus = 1;
    } else {
      billStatus = 0;
    }

    const newPurchase = new Purchase({
      purchaseId: `PUR-${purchaseId}`,
      invoiceNumber: req.body.invoiceNumber,
      invoiceDate: req.body.invoiceDate,
      invoiceType: req.body.invoiceType,
      invoiceTypeId: req.body.invoiceTypeId,
      // customer details as object
      vendorDetails: req.body.vendorDetails,

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

      // Insert purchase account id, vendor account id, and payment account id for reference to sale edit account
      purchaseAccountId: req.body.purchaseAccountId,
      vendorAccountId: req.body.vendorAccountId,
      paymentAccountId: req.body.paymentAccountId,

      balance: req.body.balance,

      // timestamp
      created: Date.now(),
      status: 1,
    });
    const updatepurchase = await newPurchase.save();
    if(updatepurchase){
      // Logs

      addLog(req.body.vendorDetails.name,'PURCHASE','UPDATE')
    }



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
      accountName: req.body.defaultPurchaseAccountName,
      accountId: req.body.purchaseAccountId,
      credit: req.body.amountAfterTax,
      journalRef: req.body.vendorAccountId,
      referenceType: 'PURCHASE',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const purchaseTransaction = await newTransactionCreditSale.save();

    if (purchaseTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.purchaseAccountId },
        { $inc: { balance: -req.body.amountAfterTax } }
      );
    }

    // 4.
    const newTransactionDebitCustomer = Transaction({
      date: new Date(req.body.invoiceDate).getTime(),
      accountName: req.body.vendorAccountName,
      accountId: req.body.vendorAccountId,
      debit: req.body.amountAfterTax,
      journalRef: req.body.purchaseAccountId,
      referenceType: 'PURCHASE',
      referenceId: req.body.invoiceNumber,
      status: 1,
      reference: lastId,
    });

    const customerTransaction = await newTransactionDebitCustomer.save();

    if (customerTransaction) {
      await Account.findOneAndUpdate(
        { _id: req.body.vendorAccountId },
        { $inc: { balance: req.body.amountAfterTax } }
      );
    }

    // 5.
    var itemsLength = req.body.item.length;

    // iterate with object items
    for (var i = 0; i < itemsLength; i++) {
      
      if(req.body.item[i].isBarcode === false){

       const item = await Item.findOne(
        {
          _id: req.body.item[i].id,
        }
        
      );

    

      const batch = await Stock.findOne(
        {
          batchName: batchName,
        }
        
      );

      if(batch){
        // Update to old batch
      

        const stockUpdate = await Stock.findOneAndUpdate(
              {
                batchName: batchName,
              },
              { $inc: { quantity: req.body.item[i].quantity } }
            );

      }else{
         
     
       
        // Create new batch
        const newStock = new Stock({
          itemId: req.body.item[i]._id ,
          inventoryId: req.body.inventoryId,
          batchName : batchName,
          quantity : req.body.item[i].quantity,
          barcode :req.body.item[i].qrCode,
          itemCode : req.body.item[i].itemCode,
    
          // timestamp
          created: Date.now(),
          status: 1,
        });

        
        const stocks = await newStock.save();

      }
        
       
      }else{
        // Is barcode enter
        const batchStock = await Stock.findOne(
          {
            barcode: req.body.item[i].qrCode,
          }
          
        );

        if(batchStock){
          // update to batch
          const stockUpdate = await Stock.findOneAndUpdate(
            {
              barcode: req.body.item[i].qrCode,
            },
            { $inc: { quantity: req.body.item[i].quantity } }
          );

        }else{
          // Create new batch
          const newStock = new Stock({
            itemId: req.body.item[i]._id ,
            inventoryId: req.body.inventoryId,
            batchName : batchName,
            quantity : req.body.item[i].quantity,
            barcode :req.body.item[i].qrCode,
            itemCode : req.body.item[i].itemCode,
      
            // timestamp
            created: Date.now(),
            status: 1,
          });
  
          
          const stocks = await newStock.save();
        }

      }
      
    }

    // 7.
    if (billStatus == 1) {
      const newTransactionCreditPurchasePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.vendorAccountName,
        accountId: req.body.vendorAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.paymentAccountId,
        referenceType: 'PURCHASE',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });
      const vendorTransactionPayment =
        await newTransactionCreditPurchasePayment.save();

      if (vendorTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.vendorAccountId },
          { $inc: { balance: -req.body.amountAfterTax } }
        );
      }

      // 8.

      const newTransactionDebitPurchasePayment = Transaction({
        date: new Date(req.body.invoiceDate).getTime(),
        accountName: req.body.defaultPaymentAccountName,
        accountId: req.body.paymentAccountId,
        credit: req.body.amountAfterTax,
        journalRef: req.body.vendorAccountId,
        referenceType: 'PURCHASE',
        referenceId: req.body.invoiceNumber,
        status: 1,
        reference: lastId,
      });

      const purchaseTransactionPayment =
        await newTransactionDebitPurchasePayment.save();
        if(purchaseId){
          // Logs
          addLog(req.body.vendorDetails.name,'PURCHASE','UPDATE')
        }
      if (purchaseTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.paymentAccountId },
          { $inc: { number: 1 } }
        );
      }
    }
  } catch (err) {
    return res.json(err);
  }
});

// get purchases return by date
router.get('/purchaseByDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);
    const purchases = await PurchaseReturn.find({
      created: { $gt: first, $lt: last },
    });
    return res.json(purchases);
    
  } catch (err) {
    return res.json(err);
  }
});

// Delete  purchase return
router.post('/delete/:id', async (req, res) => {
  try {
    // Get deleted purchase invoice number
    const invoiceNumber = req.params.id;
    // 1. Get old document id get purchase document
    // 2. update account balance
    // 3. Update transaction as inactive
    // 4. Update Inventory Stock
    // 5. update purchase document as inactive

    console.log(invoiceNumber);
    //  1.
    const oldPurchaseReturn = await PurchaseReturn.findOne({
      invoiceNumber: invoiceNumber,
    });

    //   2 & 3 .
    const oldTransaction = await Transaction.find({
      referenceType: 'PURCHASE RETURN',
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
    var itemsLength = oldpurchaseReturn.items.length;

    // iterate with object items
    for (var j = 0; j < itemsLength; j++) {
      // update in stock
      const item = await Inventory.findOneAndUpdate(
        { 'items._id': oldpurchaseReturn.items[j].id },
        {
          $inc: {
            'items.$.quantity': oldpurchaseReturn.items[j].quantity,
          },
        }
      );
    }

    // 5.
    await purchaseReturn.findOneAndUpdate(
      { _id: oldpurchaseReturn._id },
      { $set: { status: 0 } }
    );
    if(purchaseReturnId){
      // Logs
      addLog(req.body.customerDetails,'DNOTE','DELETE')
    }
  } catch (error) {
    return res.json(error);
  }
});
module.exports = router;
