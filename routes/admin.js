const admin = require('../controllers/adminController');
const express = require('express');
const upload = require('../models/multer');
const uploadMiddleware = require('../models/multer');
const adminOrderDetails = require('../controllers/adminOrderDetails');
const adminCouponController = require('../controllers/adminCouponController');
const router = express.Router();
const banner = require('../controllers/adminbannerController');
const sales = require('../controllers/salesController');
const chart = require('../controllers/chartController')
const isAdminLogged = require('../middleware/admin')


router.get('/home',isAdminLogged,admin.home);


router.get('/signin',admin.getsignin);
router.post('/signin',admin.signin);


router.get('/addProduct',isAdminLogged,admin.addProduct);
router.post('/addproduct', uploadMiddleware.array('productimage'), admin.postaddProduct);
router.get('/updateproduct/:id',isAdminLogged,admin.editProduct)
router.post('/editproduct', uploadMiddleware.array('productimage'), admin.postproductupdate);
router.get('/deleteproductimg/:element/:productId',isAdminLogged,admin.productimgdelete)
router.get('/productdelete/:id',isAdminLogged,admin.productdelete)



router.get('/categoryList',isAdminLogged,admin.categoryList);
router.get('/addCategory',isAdminLogged,admin.addCategory);
router.post('/addcategory',admin.postaddCategory);
router.get('/editCategory/:id',isAdminLogged,admin.editCategory);
router.post('/editCategory/:id',admin.postEditCategory);
router.post('/delete/:id',isAdminLogged,admin.deletecategory);



router.get('/productlist',isAdminLogged,admin.productlist);
router.get('/userlist',isAdminLogged,admin.userslist);



router.post('/block',admin.block);
router.post('/unblock',admin.unblock);

router.get('/orderDetails',adminOrderDetails.OrderDetails);
router.get('/editOrders',adminOrderDetails.editOrders);
router.post('/editOrders/:id',adminOrderDetails.orderStatus);



router.get('/listCoupon',adminCouponController.listCoupon);
router.get('/addcoupon',adminCouponController.getAddCoupon);
router.post('/addCoupon',adminCouponController.postAddCoupon);
router.get('/editCoupon/:id',adminCouponController.editCoupon);
router.post('/updateCoupon/:id',adminCouponController.updateCoupon);
router.post('/deleteCoupon/:id',adminCouponController.deleteCoupon);


router.get('/returnList',adminOrderDetails.returnList);
router.get('/return/:id',adminOrderDetails.returnItem);
router.post('/returnStatus/:id',adminOrderDetails.returnStatus);

router.get('/addBanner',banner.addBanner);
router.post('/addBanners',upload.array('bannerimage'),banner.postAddBanner);
router.get('/bannerList',banner.bannerList);
router.get('/editBanner/:id',banner.editBanner);
router.post('/updateBanner/:id',upload.array('bannerimage'),banner.updateBanner);
router.post('/deleteBanner/:id',banner.deleteBanner);

router.get('/salesReport',sales.salesReport);
router.get('/salesReportPdf/:startDate/:endDate',sales.salesPDFReport);
router.get('/salesExcelReport/:startDate/:endDate',sales.salesExcelReport);

router.get('/sales-data',chart.salesChart);
router.get('/daily-sales-data',chart.salesChartDaily)

router.get('/recent-sales', adminOrderDetails.recentSales);







router.get('/logout',admin.logout);






module.exports = router;