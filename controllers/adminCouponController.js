const couponCollection = require('../models/couponSchema');


//listCoupon
const listCoupon = async (req, res) => {
    try {
        const coupon = await couponCollection.find();
        const status = 'listCoupon';
        res.render('admin/listCoupon', { coupon, status });
    } catch (error) {
        console.error('Error fetching coupon list:', error);
        res.status(500).send('Internal Server Error');
    }
};


//addCoupon
const getAddCoupon = async (req, res) => {
    try {
        const message = req.session.message;
        req.session.message = null;
        const status = 'addCoupon';
        res.render('admin/addCoupon', { message, status });
    } catch (error) {
        console.error('Error rendering addCoupon page:', error);
        res.status(500).send('Internal Server Error');
    }
};


//postAddCoupon
const postAddCoupon = async (req, res) => {
    try {
        const coupon = await couponCollection.findOne({ code: req.body.code });
        if (coupon != null) {
            req.session.message = {
                message: 'Coupon Already Exist',
                type: 'danger',
            };
            res.redirect('/admin/addCoupon');
        } else {
            const data = {
                code: req.body.code,
                discount: req.body.discount,
                minValue: req.body.minValue,
                expiryDate: req.body.expiryDate,
                description: req.body.description,
            };
            await couponCollection.insertMany([data]);
            res.redirect('/admin/listCoupon');
        }
    } catch (error) {
        console.error('Error adding coupon:', error);
        res.status(500).send('Internal Server Error');
    }
};



//editCoupon
const editCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const message = req.session.message;
        const status = 'editCoupon' 
        const coupon = await couponCollection.findOne({ _id: id });
        res.render('admin/editCoupon', { coupon, message,status });
    } catch (error) {
        console.error('Error rendering editCoupon page:', error);
        res.status(500).send('Internal Server Error');
    }
};


const updateCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const existingCoupon = await couponCollection.findOne({ code: req.body.code });

        if (existingCoupon && existingCoupon._id.toString() !== id) {
            
            req.session.message = {
                message: 'Coupon Already Exist',
                type: 'danger',
            };
            res.redirect(`/admin/editCoupon/${id}`);
        } else {
            const data = {
                code: req.body.code,
                discount: req.body.discount,
                minValue: req.body.minValue,
                expiryDate: req.body.expiryDate,
                description: req.body.description,
            };

            
            const updatedCoupon = await couponCollection.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });

            if (!updatedCoupon) {
                req.session.message = {
                    message: 'Coupon not found',
                    type: 'danger',
                };
                res.redirect('/admin/listCoupon');
                return;
            }

            res.redirect('/admin/listCoupon');
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).send('Internal Server Error');
    }
};



//deleteCopupon
const deleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        await couponCollection.deleteOne({ _id: id });
        res.redirect('/admin/listCoupon');
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getAddCoupon,
    postAddCoupon,
    listCoupon,
    editCoupon,
    deleteCoupon,
    updateCoupon,
};
