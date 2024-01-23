
const productCollection = require('../models/productSchema');
const registercollection = require('../models/registerSchema');
const cartCollection = require('../models/cartSchema');
const session = require('express-session');

// add to cart
const addtoCart = async (req, res) => {
    try {
        const id = req.params.id;
      

        const product = await productCollection.findOne({ _id: id });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const isProductExist = await cartCollection.findOne({ userEmail: req.session.user, productId: id });
        if (isProductExist == null) {
            const product = await productCollection.findOne({ _id: id });
            let newPrice;
            const offer = product.offer
            if(offer != null) {
                newPrice = Math.round((product.price*product.offer)/100);
            }
            else{
                newPrice = product.price
            }
            const data = {
                userEmail: req.session.user,
                productId: product._id,
                productName: product.name,
                price: newPrice,
                totalPrice:newPrice,
                grandTotal: newPrice,
                image: product.images[0],
                quantity: 1
            };

            if (data.quantity > product.stock) {
                return res.redirect('/');
            }
            if(req.session.user){
            await cartCollection.insertMany([data]);
            res.redirect('/');
            }else{
                res.redirect('/login')
            }
            
        } else {
            const quantity1 = isProductExist.quantity;
            const quantity = quantity1 + 1;

            if (quantity > product.stock) {
                return res.redirect('/');
            }

            const price1 = isProductExist.totalPrice;
            const totalPrice = price1 + isProductExist.price;
            const cartId = isProductExist._id;
            await cartCollection.findOneAndUpdate({ _id: cartId }, { $set: { quantity: quantity, totalPrice: totalPrice } });
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in addtoCart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// getCart
const cart = async (req, res) => {
    try {
        const user1 = req.session.user;
        const user = await registercollection.findOne({ email: user1 });
        const cart = await cartCollection.find({ userEmail: user1 });
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

        let grandTotal1;

        if (grandTotal.length > 0) {
            grandTotal1 = grandTotal[0].total;
        } else {
            grandTotal1 = 0;
        }
        res.render('user/cart', { user, cart, grandTotal1 });
    } catch (error) {
        console.error('Error in cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// remove from cart
const removeCart = async (req, res) => {
    try {
        const productRemoveId = req.body.cartId;
        await cartCollection.deleteOne({ userEmail: req.session.user, _id: productRemoveId });
        res.redirect('/cart');
    } catch (error) {
        console.error('Error in removeCart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// update cart
const updateCartItem = async (req, res) => {
    try {
        const productUpdate = req.body.productId;
        const action = req.body.action;
        const quantity = req.body.quantity;

        const cartItem = await cartCollection.findOne({ userEmail: req.session.user, productId: productUpdate });

        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        const productData = await productCollection.findOne({ _id: productUpdate });
        const stock = productData.stock;

        if (quantity > stock) {
            return res.status(404).json({ success: false, message: 'Out of Stock' });
        }

        let totalPrice = cartItem.price;
        let grandTotal2 = cartItem.grandTotal;

        const updatedTotal = totalPrice * quantity;
        const grandTotal1 = grandTotal2 + updatedTotal;

        await cartCollection.findOneAndUpdate({ userEmail: req.session.user, productId: productUpdate }, { $set: { quantity: quantity, grandTotal: grandTotal1, totalPrice: updatedTotal } });
        const data = await cartCollection.findOne({ userEmail: req.session.user, productId: productUpdate });

        const updatedQuantity = data.quantity;
        const updatedPrice = data.totalPrice;

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
        return res.status(200).json({ message: 'Updated Successfully', updatedQuantity, updatedPrice, updatedGrandTotal });
    } catch (error) {
        console.error('Error in updateCartItem:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { cart, addtoCart, removeCart, updateCartItem };















































































































// const productCollection = require('../models/productSchema');
// const registercollection = require('../models/registerSchema');
// const cartCollection = require('../models/cartSchema');
// const session = require('express-session');

// //add to cart
// const addtoCart = async(req,res)=>{
//     const id = req.params.id;

//     const product = await productCollection.findOne({ _id:id});
//     if(!product){
//         return res.status(404).json({error:'Product not found'});
//     }
    
//     const isProductExist = await cartCollection.findOne({userEmail:req.session.user,productId:id});
//     if(isProductExist == null){
//         const product = await productCollection.findOne({_id:id});
//         const data = {
//             userEmail:req.session.user,
//             productId:product._id,
//             productName:product.name,
//             price:product.price,
//             totalPrice:product.price,
//             grandTotal:product.price,
//             image:product.images[0],
//             quantity:1
//         };

//         if (data.quantity > product.stock) {
//              return res.redirect('/');
//         }
//         await cartCollection.insertMany([data]);
//         res.redirect('/');
//     }else{
//         const quantity1 = isProductExist.quantity;
//         const quantity = quantity1+1;
        
//         if(quantity > product.stock) {
//             return res.redirect('/');

//         }
        
//         const price1 = isProductExist.totalPrice;
//         const totalPrice = price1+isProductExist.price;
//         const cartId = isProductExist._id;
//         await cartCollection.findOneAndUpdate({_id: cartId }, { $set: { quantity: quantity,totalPrice:totalPrice } });
//         res.redirect('/');
//     }   
// }

// //getCart
// const cart = async(req,res) => {
//     const user1 = req.session.user
//     const user = await registercollection.findOne({email:user1});
//     const cart = await cartCollection.find({userEmail:user1});
//     const grandTotal = await cartCollection.aggregate([
//         {
//             $match: {
//                 userEmail: req.session.user
//             }
//         },
//         {
//             $group: {
//                 _id: null,
//                 total: {
//                     $sum: '$totalPrice'
//                 }
//             }
//         }
//     ]);

//     let grandTotal1

//     if (grandTotal.length > 0) {
//         grandTotal1 = grandTotal[0].total;
//     } else {
//         grandTotal1 = 0 ;
//     }
//     res.render('user/cart',{user,cart,grandTotal1});
// }

// //reomove from cart
// const removeCart = async(req,res) => {
//     const productRemoveId = req.body.cartId;
//     await cartCollection.deleteOne({userEmail:req.session.user,_id:productRemoveId});
//     res.redirect('/cart');
// }

// //update cart
// const updateCartItem = async(req,res) => {

//     const productUpdate = req.body.productId;
//     const action = req.body.action;
//     const quantity = req.body.quantity

//     const cartItem = await cartCollection.findOne({userEmail:req.session.user,productId:productUpdate});

//     if(!cartItem) {
//         return res.status(404).json({error: 'Product not found in cart'});
//     }

//     const productData = await productCollection.findOne({_id:productUpdate});
//     const stock = productData.stock

//     if(quantity > stock){
//         return res.status(404).json({ success: false, message: 'Out of Stock' });
//     }
   

//     let totalPrice = cartItem.price;
//     let grandTotal2 = cartItem.grandTotal;

 
//     const updatedTotal = totalPrice * quantity
//     const grandTotal1 = grandTotal2 + updatedTotal;

//     await cartCollection.findOneAndUpdate({userEmail:req.session.user,productId: productUpdate }, { $set: {quantity:quantity, grandTotal:grandTotal1,totalPrice:updatedTotal } });
//     const data = await cartCollection.findOne({userEmail:req.session.user,productId:productUpdate});

//     const updatedQuantity = data.quantity;
//     const updatedPrice = data.totalPrice;

//     const grandTotal = await cartCollection.aggregate([
//         {
//             $match: {
//                 userEmail: req.session.user
//             }
//         },
//         {
//             $group: {
//                 _id: null,
//                 total: {
//                     $sum: '$totalPrice'
//                 }
//             }
//         }
//     ]);
//     const updatedGrandTotal = grandTotal[0].total;
//     return res.status(200).json({message:'Updated Successfully',updatedQuantity,updatedPrice,updatedGrandTotal});

// }




// module.exports = {cart,addtoCart,removeCart,updateCartItem};