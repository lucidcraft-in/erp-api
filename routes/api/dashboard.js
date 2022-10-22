const express = require('express');
const router = express.Router();
const Account = require('../../models/account');
const Entity = require('../../models/entity');
const Item = require('../../models/item');

const Purchase = require('../../models/purchase');

const Sale = require('../../models/sale');
const mL = ['months',
  'January','February','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec' ]



// Dashboard data counts
router.get('/counts', async (req, res) => {
  try {
    const itemCount = await Item.count({status: 1});
    const accountsCount = await Account.count({status: 1});

    const staffsCount = await Entity.count({ status: 1, type_: 1 });
    const customersCount = await Entity.count({ status: 1, type_: 2 });

    const vendorsCount = await Entity.count({ status: 1, type_: 3 });


    let obj ={
      itemCount :itemCount,
      accountsCount:accountsCount,
      staffsCount:staffsCount,
      customersCount:customersCount,
      vendorsCount:vendorsCount
    }
    return res.json(obj);
  } catch (err) {
    return res.json(err);
  }
}); 

// Dashboard sales by month graph data
router.get('/sales', async(req,res)=>{
  try{
    const salesByMonth = await Sale.aggregate([{$group: { _id: {
          // month: { $month: "$invoiceDate"},
          year: { $year: "$invoiceDate" },
        
            month: {$month: "$invoiceDate"  }
          
    }, totalSales: { $sum: "$amountAfterTax" } }},{$sort:{_id: 1}}]);

  


    return res.json(salesByMonth);
  }
  catch(err){
    return res.json(err);
  }
})

// Dashboard sales and profit by months graph data
router.get('/salesprofit',async(req,res)=>{
  try{
    const salesByMonth = await Sale.aggregate([{$group: { _id: {
      // month: { $month: "$invoiceDate"},
      year: { $year: "$invoiceDate" },
    
        month:  {$month: "$invoiceDate" }
      
}, totalSales: { $sum: "$amountAfterTax" } }},{$sort:{_id: 1}}]);
const purchaseByMonth = await Purchase.aggregate([{$group: { _id: {
  // month: { $month: "$invoiceDate"},
  year: { $year: "$invoiceDate" },

    month: {$month: "$invoiceDate"}
  
}, totalPurchase: { $sum: "$amountAfterTax" } }},{$sort:{_id: 1}}])

let obj = {
  salesByMonth :salesByMonth,
  purchaseByMonth :purchaseByMonth
}
return res.json(obj)
  }
  catch(err){
    return res.json(err)
  }
})

// Dashboard profit and loss by year data graph
router.get('/profitloss',async(req,res)=>{
  try{
    const salesByYear = await Sale.aggregate([{$group: { _id: {
      // month: { $month: "$invoiceDate"},
      year: { $year: "$invoiceDate" },
    
        // month: { $arrayElemAt: [mL, {$month: "$invoiceDate" }] }
      
}, totalSales: { $sum: "$amountAfterTax" } }}]);
const purchaseByYear = await Purchase.aggregate([{$group: { _id: {
  // month: { $month: "$invoiceDate"},
  year: { $year: "$invoiceDate" },

    // month: { $arrayElemAt: [mL, {$month: "$invoiceDate" }] }
  
}, totalPurchase: { $sum: "$amountAfterTax" } }}])



let obj = {
  salesByYear :salesByYear,
  purchaseByYear :purchaseByYear
}

let totalsales = {
  totalSales :salesByYear[0].totalSales
}
return res.json(totalsales)
  }
  catch(err){
    return res.json(err)
  }
})
// Dashboard product report of the current month

var offset = (new Date().getTimezoneOffset() / 60) * -1;
    var d = new Date();
    var tmpDate = new Date(d.getTime()+offset);
    var y = tmpDate.getFullYear();
    var m = tmpDate.getMonth();

    
router.get('/productreport',async(req,res)=>{
    try{
      var firstDay = new Date(y, m, 1);
      var lastDay = new Date(y, m + 1, 0);
      const productReport = await Sale.aggregate([{ $match: { invoiceDate: { $gt: firstDay, $lt: lastDay } } }, { $group: {"_id":"$items.name" , "number":{$sum:1}} } ])

      
    return res.json(productReport)
  }
  catch(err){
    return res.json(err)
  }
})
// Dashboard Top 10 customers Data
// router.get('/top10',async(req,res)=>{
//   try{
//     const topCustomers = await Sale.aggregate([{$group: { "_id":"$customerDetails.name","sales":{$sum:"$amountAfterTax"} } },{ $sort : { sales : -1 } },{ $limit : 5 } ] )
//     return res.json(topCustomers)
//   }
//   catch(err){
//     return res.json(err)
//   }
// })
router.get('/top10customers',async(req,res)=>{
  try{
    const top10Customers = await Sale.aggregate([{ $sort : { sales : 1 } },{$group: { _id:{customer:{"name":"$customerDetails.name"}},"sales":{$sum:"$amountAfterTax"} } },{ $limit : 5 } ] )
    return res.json(top10Customers)
  }
  catch(err){
    return res.json(err)
  }
})





module.exports = router;
