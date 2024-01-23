const registercollection = require('../models/registerSchema');
const orderCollection = require('../models/orderSchema');
const cartCollection = require('../models/cartSchema');
const productCollection = require('../models/productSchema')

const { register } = require('./userController');

const ITEMS_PER_PAGE = 2; 

//orderDetails
const orderDetails = async(req,res) => {
    
    const page = parseInt(req.query.page) || 1;
    const limit = 2; // Number of items per page
    const cart = await cartCollection.find({userEmail:req.session.user});
    const user = await registercollection.findOne({email:req.session.user});

  
    try {
      const totalItems = await orderCollection.countDocuments({userEmail:req.session.user});
      const totalPages = Math.ceil(totalItems / limit);
  
      const data = await orderCollection.find({userEmail:req.session.user})
        .skip((page - 1) * limit)
        .limit(limit);
  
        res.render('user/orderDetails', { user, orders: data, cart, totalPages, currentPage: page });

    }
catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
}
};


//cancelOrder

const cancelOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const status = 'cancelled';

        // Fetch the order
        const order = await orderCollection.findOne({ _id: id });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const totalPriceSum = order.grandTotal;

        if (order.paymentMethod === 'Online Payment') {
            // Handle refund for online payment
            const userData = await registercollection.findOne({ email: req.session.user });

            if (!userData) {
                return res.status(404).send('User not found');
            }

            const price = userData.walletBalance;
            const newPrice = price + totalPriceSum;

            // Update user's wallet balance
            await registercollection.findOneAndUpdate({ email: req.session.user }, { $set: { walletBalance: newPrice } });

            // Record the refund details
            const orderId = order._id;
            const refund = {
                price: totalPriceSum,
                orderId: orderId,
                status: 'refund',
            };

            // Push refund details to user's refund history
            await registercollection.findOneAndUpdate(
                { email: req.session.user },
                { $push: { refund: refund } },
                { new: true }
            );
        }

        // Restock products
        for (const product of order.orderItems) {

            const existingProduct = await productCollection.findOne({ _id: product.productId });

            if (existingProduct) {

                existingProduct.stock += product.quantity;

                await existingProduct.save();
            }
        }

        // Update order status to 'cancelled'
        await orderCollection.findOneAndUpdate({ _id: id }, { $set: { status: status } });

        // Set a success message in the session
        req.session.message = {
            text: 'Order cancelled successfully!',
            type: 'success',
        };

        res.redirect('/orderDetails');
    } catch (error) {
        console.error('Error cancelling order:', error);
        req.session.message = {
            text: 'Error cancelling order. Please try again later.',
            type: 'danger',
        };
        res.status(500).send('Internal Server Error');
    }
};





module.exports = {orderDetails,cancelOrder};