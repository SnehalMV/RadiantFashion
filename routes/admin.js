const {
  adminAuth, getAdminLogin, getDash, getAddProducts, getUserList, getViewProducts, putBlockUser, postAdminLogin, getLogout, postAddProducts, getEditProduct, postEditProduct, getDeleteProduct, getCategoryList, getAddCategory, postAddCategory, putDisableCategory, getOrderList, getCouponList, getAddCoupon, postAddCoupon, getEditCoupon, postEditCoupon, putDeleteCoupon,
  postChangeOrderStatus, getBannerList, getAddBanner, postAddBanner, putDisableBanner, getEditBanner, postEditBanner
} = require('../controller/adminController')
const express = require('express')
const router = express.Router()
const { upload, upload2 } = require('../config/multer')

// Login Routes For Admin
router.route('/')
  .get(getAdminLogin)
  .post(postAdminLogin)

// Routes for Dashboard and Logout
router.get('/dashboard', adminAuth, getDash)
router.get('/logout', getLogout)

// Routes for Product Management
router.get('/products', adminAuth, getViewProducts)
router.route('/addProduct')
  .get(adminAuth, getAddProducts)
  .post(upload.array('myfiles', 4), postAddProducts)

router.route('/editProduct/:id')
  .get(adminAuth, getEditProduct)
  .post(upload.array('myfiles', 4), postEditProduct)

router.get('/deleteProduct/:id', getDeleteProduct)

// Routes for User Management
router.get('/userlist', adminAuth, getUserList)
router.put('/userlist/:id', putBlockUser)

// Routes for Category Management
router.get('/categorylist', adminAuth, getCategoryList)
router.route('/addCategory')
  .get(adminAuth, getAddCategory)
  .post(postAddCategory)

router.put('/categorylist/:id', putDisableCategory)

// Routes for Order Management
router.get('/orderlist', adminAuth, getOrderList)
router.post('/changeOrderStatus', postChangeOrderStatus)

// Routes for Coupon Management
router.get('/couponlist', adminAuth, getCouponList)
router.route('/addCoupon')
  .get(getAddCoupon)
  .post(postAddCoupon)

router.route('/editCoupon/:id')
  .get(adminAuth, getEditCoupon)
  .post(postEditCoupon)

router.put('/deleteCoupon/:id', putDeleteCoupon)

// Routes for Banner Management
router.get('/bannerlist', adminAuth, getBannerList)
router.route('/addBanner')
  .get(getAddBanner)
  .post(upload2.single('image'), postAddBanner)

router.route('/editBanner/:id')
  .get(getEditBanner)
  .post(upload2.single('image'), postEditBanner)

router.put('/disableBanner/:id', putDisableBanner)

module.exports = router
