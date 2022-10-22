const express = require('express');
const router = express.Router();
const Inventory = require('../../models/inventory');
const { json } = require('body-parser');
const addLog = require('../logs/logs')

// Create Inventory
router.post('/create', async (req, res) => {
  try {
    const createInventory = Inventory({
      inventoryName: req.body.inventoryName,
      inventoryCode: req.body.inventoryCode,
      place: req.body.place,
      phone1: req.body.phone1,
      phone2: req.body.phone2,
      adress1: req.body.adress1,
      adress2: req.body.adress2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      items: req.body.items,
      status: 1,
      defaultCompany : false,

      
    });
    const inventory = await createInventory.save();
    if(inventory){
      // Logs
      addLog(req.body.inventoryName,'INVENTORY','CREATE')
    }
    return res.status(200).json(inventory);
  } catch (err) {
    return res.json(err);
  }
});

// Edit Inveontory
router.post('/update/:id', async (req, res) => {
  try {
    const inevtory = await Inventory.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          inventoryName: req.body.inventoryName,
          inventoryCode: req.body.inventoryCode,
          place: req.body.place,
          phone1: req.body.phone1,
          phone2: req.body.phone2,
          adress1: req.body.adress1,
          adress2: req.body.adress2,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          items: req.body.items,
        },
      }
    );
    if(inevtory){
      // Logs
      addLog(req.body.inventoryName,'INVENTORY','UPDATE')
    }
    return res.status(200).json(inevtory);
  } catch (err) {
    return res.json(err);
  }
});

// Get all inventories

router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find({ status: 1 });
    return res.json(inventory);
  } catch (err) {
    return res.json(err);
  }
});
module.exports = router;

// Get Single inventory
router.get('/invetory/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ _id: req.params.id });
    return res.status(200).json(inventory);
  } catch (err) {
    return res.json(err);
  }
});

// Delete inventory
router.post('/delete/:id', async (req, res) => {
  try {
    const inventoryID = await Inventory.findById({ _id: req.params.id });
    const deleteInventory = await Inventory.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: 0,
        },
      }
    );
    if(deleteInventory){
      // Logs
      addLog(inventoryID.inventoryName,'INVENTORY','DELETE')
    }
    return res.json(deleteInventory);
  } catch (err) {
    return res.json(err);
  }
});

// Add item in to inventory when , purchasing tym
router.post('/purchaseitem/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    const inventory_ = await Inventory.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $push: {
          items: {
            name: req.body.name,
            itemCode: req.body.itemCode,
            salesRate: req.body.salesRate,
            quantity: req.body.quantity,
            gstPercentage: req.body.gstPercentage,
            cess: req.body.cess,
          },
        },
      }
    );

    console.log(inventory_);
    if(inventory_){
      // Logs
      addLog(req.body.inventoryName,'INVENTORY','ADD')
    }
    return res.json(inventory_);
  } catch (err) {
    return res.json(err);
  }
});
