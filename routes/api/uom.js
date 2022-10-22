const express = require('express');
const router = express.Router();
const addLog = require('../logs/logs')

const Uom = require('../../models/uom');

// craete uom

router.post('/create', async (req, res) => {
  try {
    const newUom = Uom({
      uomName: req.body.uomName,
      quantity: req.body.quantity,
      created: Date.now(),
      status: 1,
    });
    const uom = await newUom.save();
    if(uom){
      addLog(req.body.uomName,'UOM','CREATE')
    }
    return res.status(200).json(uom);
  } catch (err) {
    return res.json(err);
  }
});

// get Uoms

router.get('/uom', async (req, res) => {
  try {
    const uom = await Uom.find({ status: 1 });
    return res.json(uom);
  } catch (err) {
    return res.json(err);
  }
});

// update uom

router.post('/update/:id', async (req, res) => {
  try {
    const uom = await Uom.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          uomName: req.body.uomName,
          quantity: req.body.quantity,
          updated: Date.now(),
          status: 1,
        },
      }
    );
    if(uom){
      addLog(req.body.uomName,'UOM','UPDATE')
    }
    return res.status(200).json(uom);
  } catch (err) {
    return res.json(err);
  }
});

//  delete

router.post('/delete/:id', async (req, res) => {
  try {
    const uomID = await Uom.findById({ _id: req.params.id });
    const uom = await Uom.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 0, deleted: Date.now() } }
    );
    if(uom){
      addLog(uomID.uomName,'UOM','DELETE')
    }
    return res.status(200).json(uom);
  } catch (err) {
    return res.json(err);
  }
});

router.get('/getById/:id', async (req, res) => {
  try {
    const uom = await Uom.findOne({ _id: req.params.id });
    return res.json(uom);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
