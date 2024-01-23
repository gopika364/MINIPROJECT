
const mongoose = require('../database/dbConnect');

const register = new mongoose.Schema({
    name:
    {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    otp:{
    type:Number
    },
    isBlock:{
        default:false,
        type:Boolean
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    referralCode : {
        type: String
    },
    refund:[{
        price:{
            type: Number
        },
        orderId:{
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
        }
    }],
    transaction:[{
        price:{
            type: Number
        },
        orderId:{
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
        }
    }],
    usedcoupons:[{
        couponName:{
            type: String
        },
    }],
    address: [{
        address1:{
            type: String
        },
        city:{
            type: String
        },
        state:{
            type: String
        },
        postCode:{
            type: String
        },
        name:{
            type:String
        },
        mobile:{
            type:Number
        },
        isDefault:{
            type:Boolean,
            default:false
        }
    }],
  
});

const registercollection = new mongoose.model('userregister',register);

module.exports = registercollection;