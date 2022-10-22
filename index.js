const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

require('dotenv').config();
app.use(cors());



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public')); 
app.use('/Images', express.static('Images'));


// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
  return res.send('Hallo node');
});

app.get('/test', (req, res) => {
  return res.send('Test');
});

const auth = require('./routes/api/auth');
const customer = require('./routes/api/customer');
const staff = require('./routes/api/staff');
const vendor = require('./routes/api/vendor');
const setting = require('./routes/api/setting');
const item = require('./routes/api/item');
const sale = require('./routes/api/sale');
const soldItem = require('./routes/api/soldItem');
const invoiceType = require('./routes/api/invoiceType');
const uom = require('./routes/api/uom');
const account = require('./routes/api/account');
const transaction = require('./routes/api/transaction');
const inventory = require('./routes/api/inventory');
const purchase = require('./routes/api/purchase');
const purchaseItem = require('./routes/api/purchaseItem');
const cNote = require('./routes/api/cnote');
const dNote = require('./routes/api/dnote');
const dashboard = require('./routes/api/dashboard');
const stock = require('./routes/api/stocks');
const notification = require('./routes/api/notification');
const voucher = require('./routes/api/voucher');
const paymentVoucher = require('./routes/api/paymentVoucher');
const excel = require('./routes/api/excel');
const getLog = require('./routes/api/getLog');
const testApi = require('./routes/api/testApi');
const reoprt = require('./routes/api/report');


 
// Connect Database.
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.CONNECTION_URL,
      // 'mongodb://lucidcraft:lucidcraft1@ds229388.mlab.com:29388/distribution-erp',
      // 'mongodb://127.0.0.1:27017/erp_distribution',
      // 'mongodb+srv://user:123@cluster0.y7krn.mongodb.net/erp?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Database Connected!');
  } catch (err) {
    console.error(err);
  }
};
connectDB();

//Use routes
app.use('/api/customers', customer);
app.use('/api/auth', auth);
app.use('/api/vendor', vendor);
app.use('/api/setting', setting);
app.use('/api/item/', item);
app.use('/api/staff', staff);
app.use('/api/sale/', sale);
app.use('/api/sold_item/', soldItem);
app.use('/api/invoiceType/', invoiceType);
app.use('/api/uom', uom);
app.use('/api/account', account);
app.use('/api/transaction', transaction);
app.use('/api/inventory', inventory);
app.use('/api/purchase/', purchase);
app.use('/api/purchase_item', purchaseItem);
app.use('/api/sale-return', cNote);
app.use('/api/purchase-return', dNote);
app.use('/api/dashboard', dashboard);
app.use('/api/stocks', stock);
app.use('/api/notification', notification);
app.use('/api/voucher',voucher);
app.use('/api/paymentVoucher',paymentVoucher);
app.use('/api/excel',excel);
app.use('/api/getLog',getLog);
app.use('/api/testApi', testApi);
app.use('/api/reports', reoprt);






const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server started!' + PORT));
