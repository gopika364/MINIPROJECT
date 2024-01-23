const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema')


const editUser = async (req, res) => {
    try {
        const userEmail = req.session.user;

        
        const user = await registercollection.findOne({ email: userEmail });

        
        const cart = await cartCollection.find({ userEmail: userEmail });

        
        res.render('user/editUser', { user, cart });
    } catch (error) {
        console.error('Error editing user:', error);
        res.status(500).send('Internal Server Error');
    }
};



const updateUser = async (req, res) => {
    const userEmail = req.session.user;
    const { name, email } = req.body;

    try {
        if (email && email !== userEmail) {

            return res.status(400).send('Invalid email provided');
        }

        await registercollection.findOneAndUpdate({ email: userEmail }, { $set: { name } });

        res.redirect('/userprofile');
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {editUser, updateUser};