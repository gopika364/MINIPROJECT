const mongoose = require('../database/dbConnect');


const wishlistSchema = new mongoose.Schema({
  productId : {
    type:mongoose.Schema.Types.ObjectId,
    ref : 'products'
  },
  userEmail : {
    type : String,
  }
});

const wishListCollection = new mongoose.model('wishList',wishlistSchema)

module.exports = wishListCollection;
