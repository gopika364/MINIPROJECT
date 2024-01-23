const orderCollection = require('../models/orderSchema');
const registerCollection = require('../models/registerSchema');
const returnCollection = require('../models/returnSchema');
const productCollection = require('../models/productSchema');

// getOrderDetails
const OrderDetails = async (req, res) => {
    try {
        const order = await orderCollection.find();
        const status = 'orderDetails';
        res.render('admin/orderDetails', { order, status });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send('Internal Server Error');
    }
};

// editOrders
const editOrders = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;

        if (!orderId || !newStatus) {
            return res.status(400).json({ success: false, error: 'Invalid request data' });
        }

        await orderCollection.updateOne({ _id: orderId }, { $set: { status: newStatus } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error editing orders:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



// orderStatus
const orderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        await orderCollection.findOneAndUpdate({ _id: id }, { $set: { status: status } });
        res.redirect('/admin/orderDetails');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};



// returnList
const returnList = async (req, res) => {
    try {
        const returnOrders = await returnCollection.find();
        const status = 'returnList';
        res.render('admin/returnList', { returnOrders, status });
    } catch (error) {
        console.error('Error fetching return list:', error);
        res.status(500).send('Internal Server Error');
    }
};



// returnItem
const returnItem = async (req, res) => {
    try {
        const id = req.params.id;
        const status = 'Return request Pending';

        const data = await orderCollection.findOne({ _id: id });

        await returnCollection.insertMany([data]);

        await orderCollection.findByIdAndUpdate({ _id: id }, { $set: { status: status } });

        const userEmail = req.session.user;
        const user = await registerCollection.findOne({ email: userEmail });


        if (user && data.totalPrice) {
            user.walletBalance += data.totalPrice;
            await user.save();
        }

        // Restock products
        for (const product of data.orderItems) {
            const existingProduct = await productCollection.findOne({ _id: product.productId });
            if (existingProduct) {
                existingProduct.stock += product.quantity;
                await existingProduct.save();
            }
        }

        res.redirect('/orderDetails');
    } catch (error) {
        console.error('Error processing return item:', error);
        res.status(500).send('Internal Server Error');
    }
};

// returnStatus
const returnStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        await orderCollection.findOneAndUpdate({ _id: id }, { $set: { status: status } });
        await returnCollection.findOneAndDelete({ _id: id });


        // If the return is accepted, restock the products
        if (status === 'Return Accepted') {
            const data = await orderCollection.findOne({ _id: id });

            for (const product of data.orderItems) {

                const existingProduct = await productCollection.findOne({ _id: product.productId });
                if (existingProduct) {
                    existingProduct.stock += product.quantity;
                    await existingProduct.save();
                }
            }
        }

        res.redirect('/admin/returnList');
    } catch (error) {
        console.error('Error updating return status:', error);
        res.status(500).send('Internal Server Error');
    }
};


const recentSales = async (req, res) => {
    try {
        const orders = await orderCollection.find();

        res.render('your-template', { orders, message: req.session.message });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { OrderDetails, editOrders, orderStatus, returnList, returnItem, returnStatus,recentSales };































































// const orderCollection = require('../models/orderSchema');
// const registercollection = require('../models/registerSchema');
// const returnCollection = require('../models/returnSchema');

// //getOrderDetails
// const OrderDetails = async (req,res) => {
//     const order = await orderCollection.find();
//     const status = 'orderDetails';

//     res.render('admin/orderDetails',{order,status});
// }

// //editOrders

// const editOrders = async (req,res) => {
//     const {orderId, newStatus} = req.body;
//     res.redirect('/admin/editOrders');

//     if(!orderId || !newStatus) {
//         return res.status(400).json({ success: false, error: 'Invalid request data' });
//     }

//     await orderCollection.updateOne({ _id: orderId }, { $set: { status: newStatus } });
//     res.json({ success: true });
// }

// const orderStatus = async(req,res) => {
//     const id = req.params.id;
//     const status = req.body.status;

//     await orderCollection.findOneAndUpdate({_id : id},{$set:{status:status}});
//     res.redirect("/admin/orderDetails")
// }

// //retunrList

// const returnList = async(req,res) => {
//     const returnOrders = await returnCollection.find();
//     const status = 'returnList';

//     res.render('admin/returnList',{returnOrders,status});
// }

// //return

// const returnItem = async(req,res) => {
//     const id = req.params.id;
//     const status = 'Return request Pending'

//     const data = await orderCollection.findOne({_id:id});

//     await returnCollection.insertMany([data]);

//     await orderCollection.findByIdAndUpdate({_id:id},{$set:{status:status}});

//     const userEmail = req.session.user;
//     const user = await registercollection.findOne({email: userEmail});

//     if(user && data.totalPrice) {
//         user.WalletBalance += data.totalPrice;
//         await user.save();
//     }

//     res.redirect('/orderDetails');
// }

// //returnStatus

// const returnStatus = async(req,res) => {
//     const id = req.params.id;
//     const status = req.body.status;
//     await orderCollection.findOneAndUpdate({_id:id},{$set:{status:status}});
//     await returnCollection.findOneAndDelete({_id:id});

//     res.redirect('/admin/returnList');
// }


// module.exports = { OrderDetails,editOrders,orderStatus,returnList,returnItem,returnStatus};