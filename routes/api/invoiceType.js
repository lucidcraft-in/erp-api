const express = require('express');
const router = express.Router();

const InvoiceType = require('../../models/invoiceType');
const { Router } = require('express');
const addLog = require('../logs/logs')

// add new invoice type

router.post('/create', async (req, res) => {
  try {
    const newInvoiceType = new InvoiceType({
      invoiceType: req.body.invoiceType,
      firstName: req.body.firstName,
      number: req.body.number,
      lastName: req.body.lastName,
      isTax: req.body.isTax,
      cess: req.body.cess,
      additionalTax: req.body.additionalTax,
      created: Date.now(),
      status: 1,
      type: req.body.type,
    });
    const invoiceType = await newInvoiceType.save();
    if(invoiceType){
      // Logs
      addLog(req.body.firstName,'INVOICETYPE','CREATE')
    }
    return res.status(200).json(invoiceType);
  } catch (err) {
    return res.json(err);
  }
});

// get

router.get('/invoiceTypes', async (req, res) => {
  try {
    const invoiceTypes = await InvoiceType.find({ status: 1 });
    return res.json(invoiceTypes);
  } catch (err) {
    return res.json(err);
  }
});

// get by types

router.get('/invoiceTypes/:type', async (req, res) => {
  try {
    const invoiceTypes = await InvoiceType.find({
      status: 1,
      type: req.params.type,
    });

    return res.json(invoiceTypes);
  } catch (err) {
    return res.json(err);
  }
});

//  update

router.post('/update/:id', async (req, res) => {
  try {
    const invoiceType = await InvoiceType.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          invoiceType: req.body.invoiceType,
          firstName: req.body.firstName,
          number: req.body.number,
          lastName: req.body.lastName,
          isTax: req.body.isTax,
          cess: req.body.cess,
          additionalTax: req.body.additionalTax,
          updated: Date.now(),
          status: 1,
          type: req.body.type,
        },
      }
    );
    if(invoiceType){
      // Logs
      addLog(req.body.firstName,'INVOICETYPE','UPDATE')
    }
    return res.status(200).json(invoiceType);
  } catch (err) {
    return res.json(err);
  }
});

// delete
router.post('/delete/:id', async (req, res) => {
  try {
    const invoiceTypeID = await InvoiceType.findById({ _id: req.params.id });
    const invoiceType = await InvoiceType.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: 0,
          deleted: Date.now(),
        },
      }
    );
    if(invoiceType){
      // Logs
      addLog(invoiceTypeID.firstName,'INVOICETYPE','DELETE')
    }
    return res.status(200).json(invoiceType);
  } catch (err) {
    return res.json(err);
  }
});

//  update invoice number

router.post('/updateInvoiceNo/:id', async (req, res) => {
  try {
    console.log('check isnside update invoice');
    console.log(req.params.id);
    console.log(req.body.number);
    const invoiceType = await InvoiceType.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          number: req.body.number,
          updated: Date.now(),
        },
      }
    );
    if(invoiceType){
      // Logs
      addLog(req.body.firstName,'INVOICETYPE','UPDATE_INVOICE_NO')
    }
    return res.status(200).json(invoiceType);
  } catch (err) {
    return res.json(err);
  }
});

// get Single
router.get('/getById/:id', async (req, res) => {
  try {
    const invoiceTypes = await InvoiceType.findOne({ _id: req.params.id });
    return res.json(invoiceTypes);
  } catch (err) {
    return res.json(err);
  }
});

// get by invoice type
router.get('/getByInvoiceType/:invoiceName', async (req, res) => {
  try {
    const invoiceTypes = await InvoiceType.findOne({
      invoiceType: req.params.invoiceName,
    });
    return res.json(invoiceTypes);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
