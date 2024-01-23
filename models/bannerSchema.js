const mongoose  = require('../database/dbConnect')


const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: Number,
    },
    description: {
        type: String,
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    category: {
        type:String
    }
    
})

const bannerCollection = new mongoose.model('banner',bannerSchema);

module.exports=  bannerCollection ;