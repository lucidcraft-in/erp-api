const express = require('express');
const router = express.Router();
const Transaction = require('../../models/transaction');
const Account = require('../../models/account');

router.post('/getBalanceSheet', async (req, res) => { 
  
    try {
      console.log('first')
        const assetCash = await Account.aggregate([{$lookup : {from :"transactions", localField: "id", foreignField: "accountId", as:"account_Details" }},
        { $match :{ accountType : "Cash" ,status : 1} } ])
        

        
        // const fixedAsset = await Transaction.find({ status:1, accountType: "Fixed assets",});
        // const Investment = await Transaction.find({ status:1, accountType: "Investment",});
        // const Bank = await Transaction.find({ status:1, accountType: "Bank",});
      
        return res.json(assetCash);
        
      } catch (err) {
        return res.json(err);
      }
      
});

module.exports = router;