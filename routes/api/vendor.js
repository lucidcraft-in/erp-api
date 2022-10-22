const express = require('express');
const router = express.Router();
const getId = require('../../utils/getId');

const Vendor = require('../../models/entity');
const Purchase = require('../../models/purchase');
const Account = require('../../models/account');
const Setting = require('../../models/setting');
const addLog = require('../logs/logs')
// add vendor

router.post('/create', async (req, res) => {
  try {
    const ids = await getId({ entityId: 1 });

    const newVendor = new Vendor({
      type_: 3,
      name: req.body.name,
      place: req.body.place,

      entityId: 'VNR_' + ids.entityId,
      email: req.body.email,
      phone1: req.body.phone1,
      phone2: req.body.phone2,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
      gstIn: req.body.gstIn,
      tn: req.body.tn,
      bankName: req.body.bankName,
      bankAddress: req.body.bankAddress,
      accountNo: req.body.accountNo,
      status: 1,
      balance: req.body.balance,
    });

    const vendor = await newVendor.save();
    if(vendor){
      addLog(req.body.name,'VENDOR','CREATE')
    }

    // create a vendor account
    const newAccount = new Account({
      accountName: req.body.name,
      accountType: 'Vendor Account  ',
      category: '',
      balance: 0,
      description: '',
      status: 1,
      type: 4,
      referenceId: vendor._id,
      // timestamp
      created: Date.now(),
    });
    const account = await newAccount.save();

    // check default Vendor check box if true

    if (req.body.defaultVendor == 'on') {
      const defaultCustm = await Setting.findOneAndUpdate(
        { status: 1 },
        {
          $set: {
            defaultVendor: vendor._id,
          },
        },
        { new: true }
      );

      console.log(vendor._id);
    }
    return res.status(200).json(vendor);
  } catch (err) {
    return res.json(err);
  }
});

// view vendor

router.get('/vendors', async (req, res) => {
  try {
    const vendor = await Vendor.find({ status: 1, type_: 3 });
    return res.json(vendor);
  } catch (err) {
    return res.json(err);
  }
});

//  view single vendor

router.get('/getById/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id });
    return res.json(vendor);
  } catch (err) {
    return res.json(err);
  }
});
// vendor transactions
router.get('/transactions/all', async (req, res) => {
  try {
    const transactions = await Purchase.aggregate
    ([{$group: { _id: {
      invoiceNumber: "$invoiceNumber",
      totalAmount: "$amountAfterTax",
      invoiceDate: "$invoiceDate",
      type : 'Purchase'
      

      
},
   }}]);
    return res.json(transactions);
  } catch (err) {
    return res.json(err);
  }
});

// Update vendor

router.post('/update/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          type_: 3,
          name: req.body.name,
          place: req.body.place,

          entityId: req.body.entityId,
          email: req.body.email,
          phone1: req.body.phone1,
          phone2: req.body.phone2,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          district: req.body.district,
          state: req.body.state,
          pincode: req.body.pincode,
          gstIn: req.body.gstIn,
          tn: req.body.tn,
          bankName: req.body.bankName,
          bankAddress: req.body.bankAddress,
          accountNo: req.body.accountNo,
          status: 1,
          balance: req.body.balance,
        },
      }
    );
    if (vendor) {
      // account
      const account = await Account.findOneAndUpdate(
        { referenceId: req.params.id },
      {
        $set: {
          accountName: req.body.name,
          accountType: 'Vendor Account  ',
          category: '',
          // balance: 0,
          description: '',
          // status: 1,
          // type: 4,
          referenceId: vendor._id,
          // timestamp
          created: Date.now(),
        },
      }
      );
      addLog(req.body.name,'VENDOR','UPDATE')
    }
    return res.status(200).json(vendor);
  } catch (err) {
    return res.json(err);
  }
});

// delete

router.post('/delete/:id', async (req, res) => {
  try {
    const vendorID = await Entity.findById({ _id: req.params.id });
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: 0,
        },
      }
    );
    if (vendor) {
      // account
      const account = await Account.findOneAndUpdate(
        { referenceId: req.params.id },
        {
          $set: {
            status: 0,
          },
        }
      );
      addLog(vendorID.name,'VENDOR','DELETE')
    }
    return res.status(200).json(vendor);
  } catch (err) {}
});
module.exports = router;
