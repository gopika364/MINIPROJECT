const mongoose = require('../database/dbConnect');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
    
});

const userSchemacollection = new mongoose.model('userListSchema',userSchema);

module.exports = userSchemacollection;