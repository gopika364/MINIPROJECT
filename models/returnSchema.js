const mongoose = require('../database/dbConnect');

const returnSchema = new mongoose.Schema({
    orderItems: [
    {
      productId: {
        type: String,
      },
      productName: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
      totalPrice: {
        type: Number,
      },
      image: {
        type: String,
      },
    }
  ],
  paymentMethod: {
    type: String,
  },
  status: {
    type: String,
    default: 'pending'
  },
  userEmail: {
    type: String,
  },
  address:{
    type:String
  },
  date: {
    type: Date,
    default: Date.now
},
});

const returnCollection = new mongoose.model('return', returnSchema);

module.exports = returnCollection;
