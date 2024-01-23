const mongoose = require('../database/dbConnect');
const mongoosePaginate = require('mongoose-paginate-v2');


const orderSchema = new mongoose.Schema({
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
  grandTotal : {
    type:Number
  },
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

orderSchema.plugin(mongoosePaginate);

const orderCollection = new mongoose.model('Order', orderSchema);

module.exports = orderCollection;
