const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('mongodb connected');
}).catch((err) => {
    console.log(err);
    console.log('connection failed,err');
});

 module.exports = mongoose;