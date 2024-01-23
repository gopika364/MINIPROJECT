const mongoose  = require('../database/dbConnect')


const couponSchema=new mongoose.Schema({
    code: {
        type: String,
    },
    discount: {
        type: Number,
    },
    minValue: {
        type: Number,
    },
    expiryDate: {
        type: String,
    },
    description: {
        type: String,
    }
})

const couponCollection = new mongoose.model('coupon',couponSchema)

module.exports=  couponCollection ;