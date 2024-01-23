const mongoose = require('../database/dbConnect');

const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        unique:false
    
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
});

const categoryCollection = new mongoose.model('category',categorySchema);

module.exports = categoryCollection ;