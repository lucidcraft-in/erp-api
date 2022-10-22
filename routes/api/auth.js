const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Inventory = require('../../models/inventory');

const jwt = require('jsonwebtoken');
const getId = require('../../utils/getId');
const Entity = require('../../models/entity');
const Setting = require('../../models/setting');
const addLog = require('../logs/logs')

const verifyToken = require('../verifyToken/VerifyToken');
const { initSettings } = require('./initSettings');

// Sign Up

router.post('/signup', async (req, res) => {
  try {
    const isSettingsIsEmpty = await Setting.findOne({ status: 1 });

    if (isSettingsIsEmpty == null || isSettingsIsEmpty.length == undefined) {
      initSettings();
    }
    if (req.body.phone1 == undefined || req.body.password == undefined)
      return res.status(404).json({
        status: 'failure',
        message: 'Phone Number or password required',
      });


    const userIsAlreadyRegistered = await Entity.findOne({
      status: 1,
      phone1: req.body.phone1,
    });

    if (userIsAlreadyRegistered)
      return res.status(404).json({
        status: 'failure',
        message: 'Phone number already registered',
      });

    //get ID
    const ids = await getId({ entityId: 1 });

    //   destructure password in to form body
    const password = req.body.password;

    //   generate Salt
    const salt = await bcrypt.genSalt(10);

    //   Create hash
    const hash = await bcrypt.hash(password, salt);

    const newAdmin = new Entity({
      name: req.body.name,
      entityId: 'STAFF_' + ids.entityId,
      email: req.body.email,
      password: hash,
      type_: 0,
      role: 'ADMIN',

      //Phones:
      phone1: req.body.phone1,
      phone2: req.body.phone2,

      //Address:
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      stateCode: req.body.stateCode,
      pinCode: req.body.pinCode,

      //Tax and bank
      gstIn: req.body.gstIn,
      tn: req.body.tn,
      bankName: req.body.bankName,
      bankAddress: req.body.bankAddress,
      accountNo: req.body.accountNo,

      status: 1,
      //Timestamps
      created: Date.now(),
      //   deleted: Number,
      //   updated: Number,
    });

    //   save data
    const admin = await newAdmin.save();
    if(admin){
      // Logs
      addLog(req.body.name,'COMPANY','CREATE')
    }
    if(admin){
      const createInventory = Inventory({
        inventoryName: req.body.name,
        defaultCompany: true,
        status: 1,
      });
      const inventory = await createInventory.save();
    }
    return res.json({
      status: 'success',
      message: 'User signed successfully',
      data: admin,
    });
  } catch (err) {
    console.log(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  // User

  const { password } = req.body;

  try {
    // 1 . find the user from db
    const user = await Entity.findOne({
      $and: [
        {
          $or: [{ type_: 0 }, { type_: 1 }],
        },
        { phone1: req.body.phone1 },
      ],
    });
    if(user){
      // Logs
      addLog(req.body.phone1,'COMPANY','LOGIN')
    }

    if (!user) {
      return res.status(404).json({
        status: 'failure',
        message: 'User Not Found',
      });
    }
    // 2. compare the  password

    const matched = await bcrypt.compare(password, user.password);
    // 3 . generate the tocken

    if (matched) {
      const user_ = {
        id: user._id,
        role: user.role,
        name: user.name,
      };
      const token = await jwt.sign(user_, 'secret', {
        expiresIn: '1 days',
      });
      // 4 . return the tocken

      return res.status(200).json({
        status: 'success',
        message: 'Login successfully',
        token: token,
        data: user_,
      });
    } else {
      return res.status(400).json({
        status: 'failure',
        message: 'Incorrect Password ',
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// gets

router.get('/', verifyToken, async (req, res) => {
  try {
    const entity = await Entity.find({ status: 1 });
    return res.json(entity);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
