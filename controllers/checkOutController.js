const RazorPay = require('razorpay');
const cartCollection = require('../models/cartSchema');
const categoryCollection = require('../models/catergorySchema');
const productCollection = require('../models/productSchema');
const registercollection = require('../models/registerSchema');
const orderCollection = require('../models/orderSchema');
const couponCollection = require('../models/couponSchema');



const razorpay = new RazorPay({
    key_id: 'rzp_test_1IphvIbZM875io',
    key_secret: 'jEuL9T3e1o2gMRiCqrmROHEf'
  })

//getCheckOut
const getCheckOut = async (req, res) => {
    try {
        const user1 = req.session.user;
        const user = await registercollection.findOne({ email: user1 });
        const cart = await cartCollection.find({ userEmail: user1 });

        const items = await cartCollection.find({ userEmail: user1 });

        const grandTotal = await cartCollection.aggregate([
            {
                $match: {
                    userEmail: req.session.user
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice'
                    }
                }
            }
        ]);

        const updatedGrandTotal = grandTotal[0].total;

        const coupon = await couponCollection.find();

        res.render('user/checkout', { user, items, updatedGrandTotal, cart, coupon });
    } catch (error) {
        console.error('Error in getCheckOut:', error);
        res.status(500).send('Internal Server Error');
    }
};


// addAddress
const addAddress = async (req, res) => {
    try {
        const address = {
            address1: req.body.address,
            city: req.body.city,
            state: req.body.state,
            postCode: req.body.postcode,
            name: req.body.name,
            mobile: req.body.mobile,
        };

        await registercollection.updateOne(
            { email: req.session.user },
            { $push: { address: address } }
        );
        
        res.redirect('/checkOut');
    } catch (error) {
        console.error('Error in addAddress:', error);
        res.status(500).send('Internal Server Error');
    }
};



// COD
const cashOnDelivery = async (req, res) => {
    try {
        const data = req.body.data;
        const couponCode = req.body.couponCode;

        if (couponCode.length > 0) {
            await registercollection.findOneAndUpdate({ email: req.session.user }, { $push: { usedcoupons: { couponName: couponCode } } });
        }

        // Iterate through order items and update product stock
        for (const item of data.orderItems) {
            const product = await productCollection.findById(item.productId);
            if (product) {
                // Decrease the stock by the purchased quantity
                product.stock -= item.quantity;
                await product.save();
            }
        }

        await orderCollection.insertMany([data]);
        await cartCollection.deleteMany({ userEmail: req.session.user });

        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error('Error in cashOnDelivery:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// razorPayOrderCreate
const razorPayOrderCreate = async (req, res) => {
    try {
        const user1 = req.session.user;
        const user = await registercollection.findOne({ email: user1 }, { name: 1, _id: 0 });

        const totalamount = req.body.totalamount;
        let options = {
            amount: totalamount * 100,
            currency: 'INR',
        };

        razorpay.orders.create(options, function (err, order) {
            if (err) {
                throw err; // Throw the error to be caught by the catch block
            }

            res.json({ order, user });
        });
    } catch (error) {
        // Handle the error, you can log it or send an appropriate response to the client
        console.error('Error in razorPayOrderCreate:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



// razorPaySuccess
const razorPaySuccess = async (req, res) => {
    try {
        const orderData = JSON.parse(req.query.data);
        const couponCode = JSON.parse(req.query.couponCode);

        if (couponCode.length > 0) {
            await registercollection.findOneAndUpdate({ email: req.session.user }, { $push: { usedcoupons: { couponName: couponCode } } });
        }

        await orderCollection.insertMany([orderData]);
        await cartCollection.deleteMany({ userEmail: req.session.user });

        res.redirect('/orderConfirmed');
    } catch (error) {
        // Handle the error, you can log it or send an appropriate response to the client
        console.error('Error in razorPaySuccess:', error);
        res.status(500).send('Internal Server Error');
    }
};


// walletPayment
const walletPayment = async (req, res) => {
    try {
        const data = req.body.data;
        const couponCode = req.body.couponCode;

        if (couponCode.length > 0) {
            await registercollection.findOneAndUpdate({ email: req.session.user }, { $push: { usedcoupons: { couponName: couponCode } } });
        }

        // Iterate through order items and update product stock
        for (const item of data.orderItems) {
            const product = await productCollection.findById(item.productId);
            if (product) {
                // Decrease the stock by the purchased quantity
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const userData = await registercollection.findOne({ email: req.session.user });
        const totalAmount = parseInt(data.grandTotal);
        const walletAmount = userData.walletBalance;

        if (totalAmount > userData.walletBalance) {
            return res.json({ message: 'Insufficient Balance' });
        } else {
            const newBalance = walletAmount - totalAmount;

            const refund = {
                price: totalAmount,
                status: 'paid'
            };
            await registercollection.findOneAndUpdate(
                { email: req.session.user },
                { $push: { refund: refund } },
                { new: true }
            );

            await orderCollection.insertMany([data]);

            await registercollection.findOneAndUpdate({ email: req.session.user }, { $set: { walletBalance: newBalance } });

            await cartCollection.deleteMany({ userEmail: req.session.user });

            return res.status(200).json({ message: 'success' });
        }
    } catch (error) {
        // Handle the error, you can log it or send an appropriate response to the client
        console.error('Error in walletPayment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { getCheckOut,addAddress,cashOnDelivery,razorPayOrderCreate,razorPaySuccess,walletPayment};