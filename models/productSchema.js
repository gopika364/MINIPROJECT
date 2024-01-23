const mongoose = require('../database/dbConnect');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    offer:{
        type:Number
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    category:{
        type:String,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
    
})

const productCollection = new mongoose.model('products',productSchema)

module.exports = productCollection;