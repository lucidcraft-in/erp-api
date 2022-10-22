const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Entity = require('../../models/entity');
const Account = require('../../models/account');
const getId = require('../../utils/getId');
const { route } = require('./vendor');
const addLog = require('../logs/logs')

// const password = req.body.password;

//     //   generate Salt
// const salt = await bcrypt.genSalt(10);

//     //   Create hash
// const hash = await bcrypt.hash(password, salt);
// const newAdmin = new Entity({
//   name: req.body.name,
//   entityId: 'STAFF_' + ids.entityId,
//   email: req.body.email,
//   password: hash,
//   type_: 0,
//   ,})


// Add Staff

router.post('/createStaff', async (req, res) => {
  
  try {
   
    const password = req.body.password;
    

    //   generate Salt
const salt = await bcrypt.genSalt(10);


    //   Create hash
const hash = await bcrypt.hash(password, salt);
console.log( hash,'hash')

    const ids = await getId({ entityId: 1 });
    const newStaff = new Entity({
      type_: 1,
      name: req.body.name,
      role: 'STAFF',
      place: req.body.place,
      password: hash,
      entityId: 'STF_' + ids.entityId,
      phone1: req.body.phone1,
      phone2: req.body.phone2,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
      bankName: req.body.bankName,
      bankAddress: req.body.bankAddress,
      accountNo: req.body.accountNo,
      ifscCode: req.body.ifsc,
      salaryAmount: req.body.salary,
      commision: req.body.commision,
      status: 1,
    });
    const Staff = await newStaff.save();
    

    if(Staff){
      addLog(req.body.name,'STAFF','CREATE')
    }

    // create a Staff account
    const newAccount = new Account({
      accountName: req.body.name,
      accountType: 'Staff Account  ',
      category: '',
      balance: '',
      description: '',
      status: 1,
      type: 3,
      referenceId: 'STF_' + ids.entityId,
      // timestamp
      created: Date.now(),
    });
    const account = await newAccount.save();
    

    if(account){
      addLog(req.body.name,'ACCOUNT','CREATE')
    }
    return res.status(200).json(Staff);
   
  } catch (err) {
    return res.json(err);
  }
});

// Edit Staff
router.post('/update/:id', async (req, res) => {
  try {
    
    const Staff = await Entity.findOneAndUpdate(
      { _id: req.params.id },

      {
        $set: {
          name: req.body.name,
          role: 'STAFF',
          place: req.body.place,
          password: req.body.password,
          phone1: req.body.phone1,
          phone2: req.body.phone2,
          address1: req.body.address1,
          address2: req.body.address2,
          city: req.body.city,
          district: req.body.district,
          state: req.body.state,
          pincode: req.body.pincode,
          bankName: req.body.bankName,
          bankAddress: req.body.bankAddress,
          accountNo: req.body.accountNo,
          ifscCode: req.body.ifsc,
          salaryAmount: req.body.salary,
          commision: req.body.commision,
        },
      }
    );
    console.log(req.params.id,'req.params.id')  
    if(Staff){
      addLog(req.body.name,'STAFF','UPDATE')
    }
    return res.status(200).json(Staff);
  } catch (err) {
    return res.json(err);
  }
});

// Get Staffs
router.get('/staffs', async (req, res) => {
  try {
    const Staffs = await Entity.find({ status: 1, type_: 1 });
    return res.status(200).json(Staffs);
  } catch (err) {
    return res.json(err);
  }
});

// Get Single Staff

router.get('/staff/:id', async (req, res) => {
  try {
    const Staff = await Entity.findOne({ _id: req.params.id });
    return res.json(Staff);
  } catch (err) {
    return res.json(err);
  }
});

// Delete Staff
router.post('/delete/:id', async (req, res) => {
  try {
   

  const Staff = await Entity.findById({ _id: req.params.id });

    const DelStaff = await Entity.findOneAndUpdate(
      { _id: req.params.id },

      {
        $set: {
          status: 0,
        },
      }
    );
    if(Staff){
      addLog(Staff.name,'STAFF','DELETE')
    }
    return res.json(DelStaff);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
