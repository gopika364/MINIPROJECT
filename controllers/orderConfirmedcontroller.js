const cartCollection = require('../models/cartSchema');
const registercollection = require('../models/registerSchema');



const orderConfirmed = async (req, res) => {
    try {
        const userEmail = req.session.user;

        const user = await registercollection.findOne({ email: userEmail });

        const cart = await cartCollection.find({ userEmail: userEmail });

        res.render('user/orderConfirmed', { user, cart });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {orderConfirmed};