const express = require('express');
const router = express.Router();
const Account = require('../../models/account');
const Stock = require('../../models/stock');
const Entity = require('../../models/entity');

 

// items
  router.get('/item', async (req, res) => {
    try {
   
    const Items =await Stock.aggregate(
      
      [
       
      {$group : {_id : {itemCode: "$itemCode", batchName:"$batchName"},totalQnt: { $sum: "$quantity" }}},
      {$lookup : {from :"items", localField: "_id.itemCode", foreignField: "itemCode", as: "item_details"}},
      // {$match:{"totalQnt" : {$gt: '$item_details.minimumQuantity'}}}
      
    ])
    let itemsArray =[];
    minQuantity = Items.map((item, index) => {
      let obj ={};
  
      if(item.totalQnt <= item.item_details[0].minimumQuantity){
        obj.minimumQuantity = item.item_details[0].minimumQuantity;
        obj.name = item.item_details[0].name;
        obj.id = item.item_details[0]._id;
        obj.itemCode = item._id.itemCode;
        obj.batchName = item._id.batchName;
        obj.qnty = item.totalQnt;

        console.log(item)
        
        itemsArray.push(obj);
      }

    })
 
      return res.json(itemsArray);
    } catch (err) {
      return res.json(err);
    }
  });
  



  
// stocks
router.get('/customer', async (req, res) => {
  try {
  console.log("as")
  const customers =await Entity.aggregate(
    
    [
      // {
      //     $sort:{ type: 2 }
      //   },
      { "$addFields": { "userId": { "$toString": "$_id" }}},
{$lookup : {from :"accounts", localField: "userId", foreignField: "referenceId", as: "customer_details"}},
{$match:{"customer_details.type" :  2}}
    
  ])
  
  let customerArray =[];
  maxCredit = customers.map((customer, index) => {
    let obj ={};

    if(customer.maximumCreditAmount >= customer.customer_details[0].balance){
      obj.maximumCreditAmount = customer.maximumCreditAmount;
      obj.balance = customer.customer_details[0].balance;
      obj.name = customer.name;
      
      
      customerArray.push(obj);
    }

  })

    return res.json(customerArray);
  } catch (err) {
    return res.json(err);
  }
});

module.exports = router;
