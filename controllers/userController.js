const userRegister = require('../models/registerSchema');
const bcrypt = require('bcrypt');
require('dotenv').config;
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const generateOTP = require('generate-otp');
const tempregister = require('../models/temporaryregister');
const validationResult = require('express-validator');
const userList = require('../models/userListSchema');
const productCollection = require('../models/productSchema');
const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema');
const categoryCollection = require('../models/catergorySchema');
const bannerCollection = require('../models/bannerSchema');


//generate Referral Code

function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
      referralCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return referralCode;
  }


// logout
const logout = (req, res) => {
    try {
        if (req.session) {
            req.session.user = null;
            req.session.message = {
                message: "Successfully logout",
                type: "success",
            };
            res.redirect('/');
        } else {
            throw new Error("Session not found");
        }
    } catch (error) {
        console.error("Error during logout:", error);
        req.session.message = {
            message: "Error during logout",
            type: "error",
        };
        res.redirect('/');
    }
};




// shop
const shop = async (req, res) => {
    try {
        const user1 = req.session.user;
        const user = await registercollection.findOne({email:user1});


        const category = await categoryCollection.find();
        const cart = await cartCollection.find({ userEmail: user1 });
        const products = await productCollection.find();
        const searchItem = 'noItem' ;

        res.render('user/shop', { user, cart, products, category, searchItem });
    } catch (error) {
        console.error("Error in shop function:", error);

        req.session.message = {
            message: "Error while fetching data for the shop",
            type: "error",
        };

        res.redirect('/');
    }
};




// shopCategory
const shopCategory = async (req, res) => {
    try {
        const user = req.session.user;
        const categoryName = req.params.categoryName;

        const category = await categoryCollection.find();
        const cart = await cartCollection.find({ userEmail: user });
        const products = await productCollection.find({ category: categoryName });

        res.render('user/shop', { user, cart, products, category });
    } catch (error) {
        console.error("Error in shopCategory function:", error);

        req.session.message = {
            message: "Error while fetching data for the shop category",
            type: "error",
        };

        res.redirect('/');
    }
};




//nodemailer
const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:process.env.EMAIL,
          pass:process.env.PASS,
        },
      });



// gethome
const gethome = async (req, res) => {
    try {
        const user1 = req.session.user;

        const cart = await cartCollection.find({ userEmail: user1 });
        const message = req.session.message;
        req.session.message = null;

        const user = await registercollection.findOne({ email: user1 });

        if (req.session.user && user.isBlock === true) {
            res.redirect('/logout');
            return;
        }

        const products = await productCollection.find();
        const recentlyAdded = await productCollection.find().sort({ _id: -1 });
        const banner = await bannerCollection.find();

        res.render('user/home', { user, products, recentlyAdded, message, cart, banner });
    } catch (error) {
        console.error("Error in gethome function:", error);

        req.session.message = {
            message: "Error while fetching data for the home page",
            type: "error",
        };

        res.redirect('/');
    }
};




// getregister
const getregister = async (req, res) => {
    try {
        const user = req.session.user;
        const cart = await cartCollection.find({ userEmail: user });
        const message = req.session.message;

        req.session.message = null;

        res.render("user/register", { user, message, cart });
    } catch (error) {
        console.error("Error in getregister function:", error);

        req.session.message = {
            message: "Error while rendering the registration page",
            type: "error",
        };

        res.redirect('/');
    }
};






//postregister

const register =asyncHandler(async (req, res) => {
     const { name, email, password,enteredReferralCode} = req.body;
     
     if(enteredReferralCode){

        req.session.referralCode = enteredReferralCode;

     }



    //check user exists
    const userExists = await userRegister.findOne({email});
    if (userExists) {
        req.session.message={
            message: 'User Already Exist',
            type: 'danger'
        }
        res.redirect('/register');
        return
    }



    // Password Hashing 
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password,salt);

    // referral Code
    const referralCode = generateReferralCode();
   

    
    // create User  and Store Hashed Password
    const user = {
        name,
        email,
        password:hashedpassword,
        referralCode
    };

    await tempregister.findOneAndDelete({ email: email });
    await tempregister.insertMany([user]);

    setTimeout(async () =>{
        await tempregister.findOneAndDelete({ email: email });
    },18000000);

    // Generate and Store OTP
    const Otp = generateOTP.generate(4,{digits:true,alphabets:false,specialChars:false});
    await tempregister.findOneAndUpdate({ email: email }, { otp: Otp });

    const expirationTime = 1 * 60 * 1000; // 1 minute in milliseconds

    setTimeout(async () => {
        // Remove the OTP from the document after 1 minute
        await tempregister.updateOne({email:email}, { $unset: { otp: 1 } });
      }, expirationTime);

    // Send Email
    const mailOptions = {
        from:process.env.EMAIL,
        to:email,
        subject:'Verify Your OTP Code - Otp will expire in 1 minute ',
        text:`Your OTP code is: ${Otp}`,
    };

    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.error('Email sent failed:' , error);
            return res.status(500).json({error: 'Failed to send verification email.'});
        }else{
            console.log('Email Send successfully:', info.response);
        }
    });
    req.session.registerEmail = email; 
    req.session.successMessage = 'Registration successful. Check your email for OTP verification.';

    res.redirect("/otp")
});





//getotp
const getotp = (req,res) => {
    const email = req.session.registerEmail;
    const message = req.session.message;
    req.session.message = null;
    res.render("user/otp",{email,message});
}




//postotp
const otp = asyncHandler(async(req,res) => {
    const email = req.params.email
    
    const otp = req.body.otpValue;
    const data = await tempregister.findOne({email:email});
   
    const sendOtp = data.otp;
   
    const userData = {
        name:data.name,
        email:data.email,
        password:data.password,
        referralCode:data.referralCode
    }
    if(otp == sendOtp){
        
        const referralCode = req.session.referralCode;
        if(referralCode){


            const wallet = await userRegister.findOne({referralCode:req.session.referralCode})
            if(wallet){
                const Balance = wallet.walletBalance
                const newBalance = Balance + 100
                const refund = {
                    price: 100,
                    orderId:'referral Earnings',
                    status:'referral'
                }
                const updatedUser = await userRegister.findOneAndUpdate(
                    { referralCode: req.session.referralCode },
                    { $set: { walletBalance: newBalance} },
                    { new: true } 
                );
                await userRegister.findOneAndUpdate(
                    { email: wallet.email },
                    { $push: { refund: refund } },
                    { new: true } 
                )
                req.session.referralCode = null;
            }
        }

        
        await userRegister.insertMany([userData])
        await tempregister.findOneAndDelete({ email: email });
        req.session.message = {
            message: "User Registred Successfully",
            type: "success",
        }
        
        res.json({message:'success'});
    
    }else{
        req.session.message = {
            message : " Invalid Otp",
            type : "danger",
        }
        
        res.json({message:'errorotp'});
    }
 
});
   





//login

const getlogin = async(req,res) => {
    const user = req.session.user;
    const cart = await cartCollection.find({userEmail:user});

    if(req.session.user){
        res.redirect('/')
    }else{
        const message = req.session.message;
        req.session.message = null
        res.render("user/login",{user,message,cart});
    }
    
 
}

//postlogin
const login =asyncHandler(async(req,res)=>{
    const {email,password} = req.body;

    //Find the user in db by email only 
    const userFound = await userRegister.findOne({
        email,
    });
   if(userFound && await bcrypt.compare(password,userFound?.password)){ //to compare the hashpassword and the plain password that is given by the user
      if(userFound.isBlock === false){
        req.session.user = email
        req.session.message={
            message: 'user sussessfully logged In',
            type: 'success',
        }
        res.redirect('/');
      }else if(userFound.isBlock === true){
        req.session.message={
            message: 'user is blocked',
            type: 'danger'
        }
        res.redirect('/login');
      }
   
   }else{
    req.session.message={
        message: 'Invalid Credentials',
        type: 'danger'
    }
    res.redirect('/login');
   }
});


//getforgotPassword
const getforgotPassword = (req,res)=>{
    res.render('user/forgotPassword');
}



const getforgotOtp = (req,res)=>{
    const email = req.session.forgetEmail
    res.render('user/forgotOtp',{email});
}



//forgotPassword
const forgotPassword =asyncHandler(async(req,res)=>{
    try{
        const email = req.body.email ;
        req.session.forgetEmail = email;
    
        const otpuserExists = await userRegister.findOne({email});
        if(otpuserExists){
            const Otp = generateOTP.generate(4,{digits:true,alphabets:false,specialChars:false});
            req.session.otp=Otp
        
            const mailOptions ={
                from:process.env.EMAIL,
                to:email,
                subject:"Your OTP",
                text:`Your OTP is ${Otp}`
            };
        
            transporter.sendMail(mailOptions,function(error,info) {
                if(error){
                    console.log(error);
                }else{
                    console.log("email send");
                }
                
            });
            res.redirect('/forgotOtp');
        }
        else{
            console.log('failed to send otp');
            res.redirect('/forgetPassword');
        }
    }catch(error){
        console.error(error);
    }

   
});

const newresetPassword = (req,res) => {
    res.render('user/resetPassword');
}





//postforgotOtp

const postforgotOtp = asyncHandler(async(req,res) => {
    const email = req.session.forgetEmail;
    const otp = req.body.otpValue;
    const sendOtp = req.session.otp;

   

    if(otp == sendOtp){

        return res.json({message:'success'});
    
    }else{
        return res.json({message:'errorotp'});
    }
 
});




//resendOtp1

const resendOtp1 = async(req,res)=> {
    const Otp = generateOTP.generate(4,{digits:true,alphabets:false,specialChars:false});
    req.session.otp = null
    req.session.otp = Otp
    const email = req.session.forgetEmail
    

            const mailOptions ={
                from:process.env.EMAIL,
                to:email,
                subject:"Your OTP",
                text:`Your OTP is ${Otp}`
            };
        
            transporter.sendMail(mailOptions,function(error,info) {
                if(error){
                    console.log(error);
                }else{
                    console.log("email send");
                }
                
            });
            res.redirect('/forgotOtp');
}





//resetPassword

const resetPassword = (req,res) => {
    res.render('user/resetPassword');
}




//postResetPass

const postResetPass = asyncHandler(async (req, res) => {
    try {
        const email = req.session.forgetEmail;
        const newPass = req.body.newPassword;
        const conPass = req.body.confirmPassword;

        if (conPass === newPass) {
            const hashedPassword = await bcrypt.hash(newPass, 10);

            await userRegister.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } });
            req.session.message = {
                message : 'Succesfully Updated',
                type : 'success'
            }
            // const user= req.session.user;
            req.session.forgetEmail = null;
            res.redirect('/login');
        } else {
            res.redirect('/reset');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('server error')
    }
});




//resendOtp
    const resendOtp = async(req,res)=> {
    const Otp = generateOTP.generate(4,{digits:true,alphabets:false,specialChars:false});
    req.session.otp = null
    req.session.otp = Otp
    const email = req.session.registerEmail
    await tempregister.findOneAndUpdate({ email: email }, { otp: Otp });
    
    const expirationTime = 1 * 60 * 1000; 

    setTimeout(async () => {

        // Remove the OTP from the document after 1 minute
        
        await tempregister.updateOne({email:email}, { $unset: { otp: 1 } });
      }, expirationTime);

            const mailOptions ={
                from:process.env.EMAIL,
                to:email,
                subject:"Your OTP",
                text:`Your OTP is ${Otp}`
            };
        
            transporter.sendMail(mailOptions,function(error,info) {
                if(error){
                    console.log(error);
                }else{
                    console.log("email send");
                }
                
            });
            res.redirect('/otp');
}



//product details

const productdetails = async(req,res) => {
    const id = req.params.id;
    const productData = await productCollection.findOne({_id:id});
    const user1 = req.session.user;
    const user = await registercollection.findOne({email:user1});
    const cart = await cartCollection.find({userEmail:user});


    res.render('user/productDetail',{user,productData,cart});
}


//search

const search = async(req,res) => {
    const user1 = req.session.user;
    const user = await registercollection.findOne({email:user1});
    const cart = await cartCollection.find({userEmail:user});
    const category = await categoryCollection.find();


    const searchItem = req.body.itemSearch;
    const products = await productCollection.find({name : searchItem});
    res.render('user/shop',{products,category,user,cart,searchItem})
}


//priceFilter

const filterShop = async(req,res) => {
    const minValue = req.query.minValue;
    const maxValue = req.query.maxValue;
    const category = req.query.category;
    let products ;
    let searchName = req.query.search;

    try{
        if(searchName && searchName != 'noItem'){
            if(category == 'all') {
                products = await productCollection.find({
                    name: searchName,
                    price: {
                      $gte: minValue,
                      $lte: maxValue
                    }
                })
            }else {
                products = await productCollection.find({
                    name: searchName,
                    category: category,
                    price: {
                      $gte: minValue,
                      $lte: maxValue
                    }
                })  
            }
            return res.json({ products });
        } else{
            if(category == 'all') {
                products = await productCollection.find({
                    price: {
                      $gte: minValue,
                      $lte: maxValue
                    }
                })
            }else {
                products = await productCollection.find({
                    category: category,
                    price: {
                      $gte: minValue,
                      $lte: maxValue
                    }
                })  
            }
            return res.json({ products });
        }
    } catch (err) {
        console.error(err)
    }
}


//categoryFilter

const catergoryFilter = async (req, res) => {
    const selectedCategory = req.query.category;
    let filteredProducts;
    const searchName = req.query.search;


    try {
        if(searchName && searchName != 'noItem'){
            if(selectedCategory =='all'){
                filteredProducts = await productCollection.find({name : searchName});
            }
            else{
                filteredProducts = await productCollection.find({ name:searchName, category: selectedCategory });
            }
            res.json({ filteredProducts });
        }else {
            if(selectedCategory =='all'){
                filteredProducts = await productCollection.find();
            }
            else{
                filteredProducts = await productCollection.find({category: selectedCategory });
            }
            res.json({ filteredProducts });
        }
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    shop,shopCategory,gethome,login,getlogin,register,getregister,getotp,otp,forgotPassword,logout,resetPassword,getforgotPassword,postforgotOtp,postResetPass,resendOtp,
    getforgotOtp,productdetails,newresetPassword,resendOtp1,search,filterShop,catergoryFilter

}