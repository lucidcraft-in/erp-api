const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');



// get purchase
router.get('/result', async () => {

var result = false;


    console.log('hiii')
    try {
        await mongoose.connect(
          process.env.CONNECTION_URL,
         
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        );
        console.log('result')
      //   console.log('Database Connected!');
        result = true ; 
        console.log(result)

        return result ; 
        
      } catch (err) {
        console.error(err);
        return result  = false ;
      }
  });
  // Connect Database.
// const connectDB = async () => {
   
//   };
//   connectDB()
module.exports = router;