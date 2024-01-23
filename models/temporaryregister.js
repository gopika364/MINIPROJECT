
const mongoose = require('../database/dbConnect');

const tempregister = new mongoose.Schema({
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
    referralCode : {
        type: String
    },
    otp:{
        type:Number
    }
});

const tempregistercollection = new mongoose.model('tempuserregister',tempregister);

module.exports = tempregistercollection;