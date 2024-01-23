const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema');
const { register } = require('./userController');


const wallet = async (req, res) => {
    try {
        const user1 = req.session.user;

        
        const user = await registercollection.findOne({ email: user1 });
        const cart = await cartCollection.find({ userEmail: user1 });

        res.render('user/wallet', { user, cart });
    } catch (error) {
        console.error("Error in wallet function:", error);

        
        req.session.message = {
            message: 'Error while rendering the wallet page',
            type: 'error'
        };

        
        res.redirect('/');
    }
};


module.exports = {
    wallet
};