const express = require('express');

const path = require('path');
const db = require('./database/dbConnect');
const session = require('express-session');


const user = require('./routes/user');
const admin = require('./routes/admin'); 

const fs = require('fs');
const PDFDocument = require('pdfkit');

const Order = require('./models/orderSchema');

const productCollection = require('./models/productSchema');
const registercollection = require('./models/registerSchema');
const cartCollection = require('./models/cartSchema');
const categoryCollection = require('./models/catergorySchema');


const app = express();
app.use((req, res, next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next()
  })

app.use(session({
    secret:['gfhf','wnbjb','gggd','yuut','ffgt','ggg'],
    saveUninitialized:true,
    resave:false
}))

app.use(express.json())
app.set('views','views')
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));


//user
app.use('/',user);

//admin
app.use('/admin',admin);












// create Server
const port = 3000;
app.listen(port,()=>{
    console.log("server is running on http://localhost:3000")});

    