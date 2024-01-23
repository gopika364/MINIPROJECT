const mongoose = require('../database/dbConnect');

const cartSchema = new mongoose.Schema({
    userEmail:{
        type:String
    },
    productId:{
        type:String
    },
    productName:{
        type:String
    },
    quantity:{
        type:Number,
        default:1
    },
    price:{
        type:Number
    },
    totalPrice:{
        type:Number
    },
    image:{
        type:String
    },
    grandTotal:{
        type:Number
    }
});

const cartCollection = new mongoose.model('cart',cartSchema);

module.exports = cartCollection ;