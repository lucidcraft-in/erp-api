const express = require('express');
const router = express.Router();
const getId = require('../../utils/getId');
const Purchase = require('../../models/purchase');
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');
const Item = require('../../models/item');
const InvoiceType = require('../../models/invoiceType');
const Stock = require('../../models/stock');


const addLog = require('../logs/logs')

// getLast Id

router.get('/getlastid', async (req, res) => {
  try {
    const getId = await Purchase.find().sort({ _id: -1 }).limit(1);
    return res.json(getId[0].purchaseId);
  } catch (err) {
    return res.json(err);
  }
});

// new purchase

var lastId = 0;
router.post('/create', async (req, res) => {
  try {
    const { purchaseId } = await getId({ purchaseId: 1 });
  
    // ---------Algorithm-------------------------------

    // 1 . check balance of invoice,
    // 2.   insert purchase document
    // 3.   insert transaction as credit => sale and update balance
    // 4.   insert transaction as debit => customer and update balance
    // 5.   update inventory stock
    // 6.   check bill status,
    // 7.   insert transaction as credit => customer and update balance
    // 8.   insert transaction as debit => cash or bank  and update balance
    // 9.   Update series number

    // ---------Algorithm end-----------------------------

    // if its 1, then invoice is full payment and 0 its credited some balance to vendor
    if (req.body.balance === 0) {
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
    const purchase = await newPurchase.save();
    if(purchase){
      // Logs

      addLog(req.body.vendorDetails.name,'PURCHASE','CREATE')
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
      // update in stock

      

      if (req.body.item[i].empty === false) {
      console.log(req.body.item)
       
        const batchName = req.body.item[i].itemCode + '_' + req.body.item[i].purchaseRate;
      
 
     
        if (req.body.item[i].isBarcode === false) {

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

       

       

          if (batch) {
            // Update to old batch
       

            const stockUpdate = await Stock.findOneAndUpdate(
              {
                batchName: batchName,
              },
              { $inc: { quantity: req.body.item[i].quantity } }
            );

          } else {

             
            
        
            // Create new batch
            const newStock = new Stock({
              itemId: req.body.item[i].id,
              inventoryId: req.body.inventoryId,
              batchName: batchName,
              quantity: req.body.item[i].quantity,
              barcode: req.body.item[i].qrCode,
              itemCode: req.body.item[i].itemCode,
              purchaseRate: req.body.item[i].purchaseRate,
              // timestamp
              created: Date.now(),
              status: 1,
            });

        
 
        
            const stocks = await newStock.save();

          }
        
       
        } else {
          // Is barcode enter
          const batchStock = await Stock.findOne(
            {
              barcode: req.body.item[i].qrCode,
            }
          
          );

          if (batchStock) {
            // update to batch
            const stockUpdate = await Stock.findOneAndUpdate(
              {
                barcode: req.body.item[i].qrCode,
              },
              { $inc: { quantity: req.body.item[i].quantity } }
            );

          } else {
            // Create new batch
            const newStock = new Stock({
              itemId: req.body.item[i].id,
              inventoryId: req.body.inventoryId,
              batchName: batchName,
              quantity: req.body.item[i].quantity,
              barcode: req.body.item[i].qrCode,
              itemCode: req.body.item[i].itemCode,
              purchaseRate: req.body.item[i].purchaseRate,
              // timestamp
              created: Date.now(),
              status: 1,
            });
  
          
            const stocks = await newStock.save();
          }

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

      if (purchaseTransactionPayment) {
        await Account.findOneAndUpdate(
          { _id: req.body.paymentAccountId },
          { $inc: { number: 1 } }
        );
      }
    }

    // 9.
    await InvoiceType.findOneAndUpdate(
      { _id: req.body.invoiceTypeId },
      { $inc: { number: 1 } }
    );
    
    return res.status(200).json(purchase);
  } catch (err) {
    return res.json(err);
  }
});

// get purchase
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: 1 });
    return res.json(purchases);
  } catch (err) {
    return res.json(err);
  }
});

// get purchase by date
router.get('/purchaseByDate/:firstDate/:lastDate', async (req, res) => {
  try {
    var first = Date.parse(req.params.firstDate);
    var last = Date.parse(req.params.lastDate);
    const purchases = await Purchase.find({
      created: { $gt: first, $lt: last },
      status: 1,
    });
    return res.json(purchases);
  } catch (err) {
    return res.json(err);
  }
});

// Get purchase
router.get('/:id', async (req, res) => {
 
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id });
 
    return res.json(purchase);
  } catch (err) {
    return res.json(err);
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

      if (oldPurchase.items[j].empty === false){
        let batch =
          oldPurchase.items[j].itemCode +
          '_' +
          oldPurchase.items[j].purchaseRate;

        const item = await Stock.findOneAndUpdate(
          {
            batchName: batch,
          },
          { $inc: { quantity: -oldPurchase.items[j].quantity } }
        );

       
      }

 
    

     
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
    const updatePurchase = await newPurchase.save();

    
    if (updatePurchase) {
      // Logs

      addLog(req.body.vendorDetails.name, 'PURCHASE', 'UPDATE');
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

      
    

      if (req.body.item[i].empty === false) {
      
        if (req.body.item[i].isBarcode === false) {

             const batchName =
               req.body.item[i].itemCode +
               '_' +
               req.body.item[i].purchaseRate;

    

          const batch = await Stock.findOne(
            {
              batchName: batchName,
            }
        
          );

          if (batch) {
            // Update to old batch
      

            const stockUpdate = await Stock.findOneAndUpdate(
              {
                batchName: batchName,
              },
              { $inc: { quantity: req.body.item[i].quantity } }
            );

          } else {
         
     
       
            // Create new batch
            const newStock = new Stock({
              itemId: req.body.item[i]._id,
              inventoryId: req.body.inventoryId,
              batchName: batchName,
              quantity: req.body.item[i].quantity,
              barcode: req.body.item[i].qrCode,
              itemCode: req.body.item[i].itemCode,
              purchaseRate: req.body.item[i].purchaseRate,
    
              // timestamp
              created: Date.now(),
              status: 1,
            });

        
            const stocks = await newStock.save();

          }
        
       
        } else {
          // Is barcode enter
          const batchStock = await Stock.findOne(
            {
              barcode: req.body.item[i].qrCode,
            }
          
          );

          if (batchStock) {
            // update to batch
            const stockUpdate = await Stock.findOneAndUpdate(
              {
                barcode: req.body.item[i].qrCode,
              },
              { $inc: { quantity: req.body.item[i].quantity } }
            );

          } else {
            // Create new batch
            const newStock = new Stock({
              itemId: req.body.item[i]._id,
              inventoryId: req.body.inventoryId,
              batchName: batchName,
              quantity: req.body.item[i].quantity,
              barcode: req.body.item[i].qrCode,
              itemCode: req.body.item[i].itemCode,
              purchaseRate: req.body.item[i].purchaseRate,
      
              // timestamp
              created: Date.now(),
              status: 1,
            });
  
          
            const stocks = await newStock.save();
          }

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

     return res.json({ message: 'success', statusCode: 200 });
  } catch (err) {
    return res.json(err);
  }
});

// delete
router.post('/delete/:id', async (req, res) => {
  try {
   const DelPurchase =  await Purchase.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 0, deleted: Date.now() } }
    );
    if(DelPurchase){
      // Logs

      addLog(req.body.customerDetails.name,'PURCHASE','DELETE')
    }
    return res.json(true);
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});

module.exports = router;
