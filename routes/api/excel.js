const express = require('express');
const router = express.Router();
const Item = require('../../models/item');
const Stock = require('../../models/stock');

const fs = require("fs");
const { parse } = require("csv-parse");
const reader = require('xlsx');
// const fs = require('fs');
const fse = require('fs-extra');
const { response } = require('express');

router.post('/uploadExcel/', async (req, res) => {
  
  let fileName = req.body.filename;
  const src = 'E:\\\essae\\' + fileName + '.csv';
  const dest = './excel/' + fileName + '.csv';

  let productData=[];
  fse
    .copy(src, dest,{ overwrite: false })
    .then(() => {
       
      try {

        var SheetNames=[];
    fs.createReadStream('./excel/' + fileName + '.csv')
        .pipe(parse({delimiter: ',', from_line: 1 }))
    .on('data', async function(csvrow) {

        //do something with csvrow
        SheetNames.push({itemCode : csvrow[0],qnt:csvrow[1]});        
    })
    .on('end',async function() {
      //do something with SheetNames

      let array =[];
      Promise.all(SheetNames.map(async (file) => {
           
        const itemStock = await Stock.find({ itemCode: file.itemCode,quantity: {$gt: file.qnt}}  );
        console.log(itemStock,'itemStock')
        let stocks;
        // only one batch
        if(itemStock.length ===1){

            stocks = await  Stock.aggregate( [
            { "$match": { "itemCode":  file.itemCode } },
            {
              $lookup:
                {
                  from: "items",
                  localField: "itemCode",
                  foreignField: "itemCode",
                  as: "item_stock",
                
                }
              },
              
            ] )
            
        
        }
        // when multiple batch
       
        else{
          console.log(Stock,'Stock')
          stocks = await  Stock.aggregate( [

            { "$match": { "itemCode":  itemStock[0].itemCode } },
            {
              $lookup:
                {
                  from: "items",
                  localField: "itemCode",
                  foreignField: "itemCode",
                  as: "item_stock",
                
                }
              },
              
            ] )
        }
       
        stocks[0].quantity = parseFloat(file.qnt);
      
       
        array.push(stocks[0]);
         
      })).then(() => {
          res.send(array);
        
      })
     
    });
   
   
      } catch (err) {
        res.send(err);
      }
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});


 

// const reader = require('xlsx');

router.get('/readexcelfile/', (req, res) => {
  console.log('hii');
  let fileName = req.query.filename;
  console.log(fileName);
  let data = [];
  try {
    const file = parse.readFile('./Images/excel/' + fileName + '.csv');
    const sheetNames = file.SheetNames;
    console.log('ddbhjsdhjd');
    console.log(sheetNames);
    for (let i = 0; i < sheetNames.length; i++) {
      const arr = parse.utils.sheet_to_json(file.Sheets[sheetNames[i]]);
      arr.forEach((res) => {
        data.push(res);
      });
    }
    res.send(data);
  } catch (err) {
    res.send(err);
  }
});

// read excel file
// const reader = require('xlsx')

// // Reading our test file
// const file = reader.readFile('excel/19-08-2022.xlsx')

// let data = []

// const sheets = file.SheetNames

// for(let i = 0; i < sheets.length; i++)
// {
//    const temp = reader.utils.sheet_to_json(
//         file.Sheets[file.SheetNames[i]])
//    temp.forEach((res) => {
//       data.push(res)
//    })
// }

// // Printing data
// console.log(data)
// router.get('/staffs', async (req, res) => {
//     try {
//       const Staffs = await Entity.find({ status: 1, type_: 1 });
//       return res.status(200).json(Staffs);
//     } catch (err) {
//       return res.json(err);
//     }
//   });

module.exports = router;
