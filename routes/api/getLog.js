const Logs = require('../../models/logs');
const express = require('express');
const router = express.Router();



  // view vendor

  router.get('/logs', async (req, res) => {
    try {
      const log = await Logs.find();
      return res.json(log);
    } catch (err) {
      return res.json(err);
    }
  });
  module.exports = router;