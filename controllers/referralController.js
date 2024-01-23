const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema');

//referralCode

const referralCode = async(req,res) => {
    const user1 = req.session.user;

    const user = await registercollection.findOne({email:user1});
    const cart = await cartCollection.find({userEmail:user1});

    const baseUrl = 'http://localhost:4000';

    res.render('user/referralCode',{user,cart,referralCode:user.referralCode,baseUrl});
  }
  
  module.exports = {
    referralCode
  }