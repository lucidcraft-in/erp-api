const express = require('express');
const router = express.Router();
const getId = require('../../utils/getId');
const Entity = require('../../models/entity');
const Setting = require('../../models/setting');
const Sale = require('../../models/sale');
const Account = require('../../models/account');
const addLog = require('../logs/logs')
/**
 * get all customers
 * GET /api/customers
 */
router.get('/', async (req, res) => {
  try {
    const customers = await Entity.find({ status: 1, type_: 2 });
    return res.json(customers);
  } catch (err) {
    return res.json(err);
  }
});

/**
 * get a single customer's document by
 * GET /api/customrer/byId/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const customer = await Entity.findOne({ _id: req.params.id });
    return res.json(customer);
  } catch (err) {
    return res.json(err);
  }
});
// single customers transactions
router.get('/transactions/all', async (req, res) => {
  try {
    const transactions = await Sale.aggregate
    ([{$group: { _id: {
      invoiceNumber: "$invoiceNumber",
      totalAmount: "$amountAfterTax",
      invoiceDate: "$invoiceDate",
      type : 'sale'
      

      
},
   }}]);
    return res.json(transactions);
  } catch (err) {
    return res.json(err);
  }
});
/**
 * Create a customer
 * POST /api/customer/create
 */
router.post('/create', async (req, res) => {
  try {
    //get ID
    const ids = await getId({ entityId: 1 });

    console.log(req.body.place);
    const newCustomer = new Entity({
      name: req.body.name,
      entityId: 'CST_' + ids.entityId,
      type_: 2, ///
      email: req.body.email,
      password: req.body.password,
      //Phones:
      phone1: req.body.phone1,
      phone2: req.body.phone2,
      //Address:
      place: req.body.place,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
      //Salary:
      salaryType: req.body.salaryType,
      salaryAmount: req.body.salaryAmount,
      maximumCreditAmount:req.body.maximumCreditAmount,
      // sale pricing
      salePrice: req.body.salePrice,
      //Tax and bank
      gstIn: req.body.gstIn,
      tn: req.body.tn,
      bankName: req.body.bankName,
      bankAddress: req.body.bankAddress,
      accountNo: req.body.accountNo,
      ifscCode: req.body.ifsc,
      balance: req.body.balance,
      //Timestamps
      status: 1,
      created: Date.now(),
    });
    const customer = await newCustomer.save();

    
    if(customer){
      console.log(customer)
      // Logs
      addLog(req.body.name,'CUSTOMER','CREATE')
    }

    // create a customer account
    const newAccount = new Account({
      accountName: req.body.name,
      accountType: 'Customer Account',
      category: req.body.category,
      balance: 0,
      description: req.body.description,
      status: 1,
      type: 2,
      referenceId: customer._id,
      // timestamp
      created: Date.now(),
    });
    const account = await newAccount.save();

    // check default customer check box if true
    console.log(account);
    if (req.body.defaultCustomer == 'on') {
      console.log(req.body.defaultCustomer);
      const defaultCustm = await Setting.findOneAndUpdate(
        { status: 1 },
        {
          $set: {
            defaultCustomer: customer._id,
          },
        },
        { new: true }
      );
      console.log(defaultCustomers);
    }
    return res.json(customer);
  } catch (err) {
    return res.json(err);
  }
});

/**
 * Update a customer
 * POST /api/customer/create
 */
router.post('/update/:id', async (req, res) => {
  try {
   const customer =  await Entity.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          //Phones:
          phone1: req.body.phone1,
          phone2: req.body.phone2,
          //Address:
          place: req.body.place,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          district: req.body.district,
          state: req.body.state,
          pincode: req.body.pincode,
          //Salary:
          salaryType: req.body.salaryType,
          salaryAmount: req.body.salaryAmount,
          maximumCreditAmount:req.body.maximumCreditAmount,
          
          // pricing
          salePrice: req.body.salePrice,
          //Tax and bank
          gstIn: req.body.gstIn,
          tn: req.body.tn,
          bankName: req.body.bankName,
          bankAddress: req.body.bankAddress,
          accountNo: req.body.accountNo,
          ifscCode: req.body.ifsc,
          balance: req.body.balance,
          //Timestamps
          updated: Date.now(),
        },
      }
    );
    if (customer) {
      // accounts
      const account = await Account.findOneAndUpdate(
        { referenceId: req.params.id },
      {
        $set: {
          accountName: req.body.name,
          accountType: 'Customer Account',
          category: req.body.category,
          // balance: 0,
          description: req.body.description,
          // status: 1,
          // type: 2,
          referenceId: customer._id,
          // timestamp
          created: Date.now(),
        },
      }
      );
      // Logs
      addLog(req.body.name,'CUSTOMER','UPDATE')
    }
    return res.json(true);
  } catch (err) {
    return res.json(err);
  }
});

// update customer balance
router.post('/updateBalance/:id', async (req, res) => {
  try {
    const customer = await Entity.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { balance: req.body.balance, updated: Date.now() } }
    );
    if(customer){
      // Logs
      addLog(req.body.name,'CUSTOMER','UPDATE BALANCE')
    }
    return res.json(customer);
  } catch (err) {
    return res.json(err);
  }
});

/**
 * Delete a customer by entityId
 * POST /api/customer/delete/:id
 */
router.post('/delete/:id', async (req, res) => {
  try {
    const customerID = await Entity.findById({ _id: req.params.id });
   const customer =  await Entity.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 0, deleted: Date.now() } }
    );
    console.log('a');
    if (customer) {
      // account 
      const account =  await Account.findOneAndUpdate(
        { referenceId: req.params.id },
        { $set: { status: 0, deleted: Date.now() } }
      );
      // Logs
      addLog(customerID.name,'CUSTOMER','DELETE')
    }
    return res.json(true);
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});

// Get All entity
router.get('/enties/all', async (req, res) => {
  try {
    const customers = await Entity.find({
      status: 1,
      $or: [{ type_: 1 }, { type_: 2 }, { type_: 3 }],
    });
    return res.json(customers);
  } catch (err) {
    return res.json(err);
  }
});

/**
 * get all customers
 * GET /api/customers
 */
 router.get('/transaction/all', async (req, res) => {
  try {
    const customers = await Entity.find({ status: 1, type_: 2 });
    return res.json(customers);
  } catch (err) {
    return res.json(err);
  }
});


module.exports = router;
