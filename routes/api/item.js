const express = require('express');
const router = express.Router();
const Item = require('../../models/item');
const ItemCategory = require('../../models/itemCategory')
const getId = require('../../utils/getId');
const path = require('path')
const addLog = require('../logs/logs')
const multer = require('multer');
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null, 'Images')
  },
filename:(req,file,cb)=>{
  console.log(file)
  cb(null, Date.now() + path.extname(file.originalname))
}
})
const upload = multer({storage:storage});




// Add Item

router.post('/create',upload.single('productImage'), async (req, res) => {
  try {
  
  
    const itemExist = await Item.findOne({ itemCode: req.body.itemCode, status :1});
    
    if(itemExist){
     
      return res.status(201).json({error :"item code already exist"});
    }
 
    let image;
 
console.log(req.body.ifImage,'req.body.ifImage')
    if(req.body.ifImage){
      
      image =  req.file.filename;
   
    }else{
      
      image ='';
    }
  // console.log(image)
   
    const newItem = Item({
      name: req.body.name,
      image: image,
      mfgDate: req.body.mfgDate,
      expDate: req.body.expDate,
      company: req.body.company,
      hsnCode: req.body.hsnCode,
      itemCategory: req.body.itemCategory,
      mrp: req.body.mrp,
      purchaseRate: req.body.purchaseRate,
      salesRate: req.body.salesRate,

      salesRate2: req.body.salesRate2,
      salesRate3: req.body.salesRate3,
      salesRate4: req.body.salesRate4,
      salesRate5: req.body.salesRate5,
      status: 1,
      itemCode: req.body.itemCode,
      profit: req.body.profit,
      wholeSaleRate: req.body.wholeSaleRate,
      description: req.body.description,
      group: req.body.group,

      gstPercentage: req.body.gstPercentage,
      cgstPercentage: req.body.cgstPercentage,
      igstPercentage: req.body.igstPercentage,
      sgstPercentage: req.body.sgstPercentage,
      minimumQuantity: req.body.minimumQuantity,
      created: Date.now(),

      quantity: 0,
    });

    // console.log('newItem', newItem);
    const item = await newItem.save();

    if(item){
      // Logs
      addLog(req.body.name,'ITEM','CREATE')
    }


    return res.status(200).json(item);
  } catch (err) {
    return res.json(err);
  }
});

// get items

router.get('/items', async (req, res) => {
  try {
    const item = await Item.find({ status: 1 });
    return res.json(item);
  } catch (err) {
    return res.json(err);
  }
});

// view single item
router.get('/getById/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id });
    return res.json(item);
  } catch (err) {
    return res.json(err);
  }
});

// update item

router.post('/update/:id',upload.single('productImage'), async (req, res) => {
  try {
    

    let image;
    console.log('type of -',typeof req.body.ifImageEdited);
   
    if(req.body.ifImageEdited === 'true'){
       
      console.log('if')
      image =  req.file.filename;
   
    }else{
       
      console.log('else')
      image =req.body.oldImage;
    }

    // console.log(image,'imagess')
  
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          image: image,
          name: req.body.name,
          mfgDate: req.body.mfgDate,
          expDate: req.body.expDate,
          company: req.body.company,
          hsnCode: req.body.hsnCode,
          itemCategory: req.body.itemCategory,
          mrp: req.body.mrp,
          purchaseRate: req.body.purchaseRate  ,
          salesRate: req.body.salesRate  ,
          salesRate2: req.body.salesRate2 ,
          salesRate3: req.body.salesRate3 ,
          salesRate4: req.body.salesRate4 ,
          salesRate5: req.body.salesRate5 ,
          status: 1,
          itemCode: req.body.itemCode ,
          profit: req.body.profit ,
          wholeSaleRate: req.body.wholeSaleRate ,
          description: req.body.description ,
          group: req.body.group ,

          gstPercentage: req.body.gstPercentage,
          igstPercentage: req.body.igstPercentage,
          sgstPercentage: req.body.sgstPercentage ,
          cgstPercentage: req.body.cgstPercentage,
          minimumQuantity: req.body.minimumQuantity ,
          updated: Date.now(),
        },
      }
    );
    console.log('item', item);
    if(item){
      // Logs
      addLog(req.body.name,'ITEM','UPDATE')
    }
    return res.status(200).json(item);
  } catch (err) {
    return res.json(err);
  }
});

// delete item

router.post('/delete/:id', async (req, res) => {
  try {
    const itemID = await Item.findById({ _id: req.params.id });
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: 0,
          deleted: Date.now(),
        },
      }
    );
    if(item){
      // Logs
      addLog(itemID.name,'ITEM','DELETE')
    }
    return res.status(200).json(item);
  } catch (err) {
    return res.json(err);
  }
});

// Item category create
router.post('/category/create', upload.single('image'),async (req, res) => {
  try {
    let image;
 
// console.log(req.body.ifImage,'req.body.ifImage')
    if(req.body.ifImage){
      
      image =  req.file.filename;
      console.log(req.file.filename,'image')
    }else{
      
      image ='';
    }

    const newCategory = ItemCategory({
      name:req.body.name,
      image:image,
      
      status: 1,
      created: Date.now(),
    });
    
    const itemCategory = await newCategory.save();
    return res.status(200).json(itemCategory);
  } catch (err) {
    return res.json(err);
  }
});

// Item Category get
router.get('/category', async (req, res) => {
  try {
    const itemCategory = await ItemCategory.find({ status: 1 });
    return res.json(itemCategory);
  } catch (err) {
    return res.json(err);
  }
});

// Item Category Delete
router.post('/category/delete/:id', async (req, res) => {
  try {
    const itemCategoryID = await ItemCategory.findById({ _id: req.params.id });
    const itemCategory = await ItemCategory.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          status: 0,
          deleted: Date.now(),
        },
      }
    );
    if(itemCategory){
      // Logs
      addLog(itemCategoryID.name,'ITEM CATEGORY','DELETE')
    }
    return res.status(200).json(itemCategory);
  } catch (err) {
    return res.json(err);
  }
});


module.exports = router;
