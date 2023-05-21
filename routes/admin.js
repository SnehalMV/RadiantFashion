const {
  adminAuth, getAdminLogin, getDash, getAddProducts, getUserList, getViewProducts, putBlockUser, postAdminLogin, getLogout, postAddProducts, getEditProduct, postEditProduct, getDeleteProduct, getCategoryList, getAddCategory, postAddCategory, putDisableCategory, getOrderList, getCouponList, getAddCoupon, postAddCoupon, getEditCoupon, postEditCoupon, putDeleteCoupon,
  postChangeOrderStatus, getBannerList, getAddBanner, postAddBanner, putDisableBanner, getEditBanner, postEditBanner
} = require('../controller/adminController')
const express = require('express')
const router = express.Router()
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/banners')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })
const upload2 = multer({ storage: storage2 })

// Login Routes For Admin
router.route('/')
  .get(getAdminLogin)
  .post(postAdminLogin)

// Routes for Dashboard
router.get('/dashboard', adminAuth, getDash)
router.route('/addProduct')
  .get(adminAuth, getAddProducts)
  .post(upload.array('myfiles', 4), postAddProducts)

// Routes for Lists
router.get('/products', adminAuth, getViewProducts)
router.get('/userlist', adminAuth, getUserList)
router.put('/userlist/:id', putBlockUser)
router.get('/logout', getLogout)
router.route('/editProduct/:id')
  .get(adminAuth, getEditProduct)
  .post(upload.array('myfiles', 4), postEditProduct)

// Route to Add Stuff
router.route('/addCategory')
  .get(adminAuth, getAddCategory)
  .post(postAddCategory)

router.get('/deleteProduct/:id', getDeleteProduct)
router.get('/categorylist', adminAuth, getCategoryList)
router.put('/categorylist/:id', putDisableCategory)
router.get('/orderlist', adminAuth, getOrderList)
router.route('/addCoupon')
  .get(getAddCoupon)
  .post(postAddCoupon)

router.get('/couponlist', adminAuth, getCouponList)
router.route('/editCoupon/:id')
  .get(adminAuth, getEditCoupon)
  .post(postEditCoupon)

router.put('/deleteCoupon/:id', putDeleteCoupon)
router.post('/changeOrderStatus', postChangeOrderStatus)
router.get('/bannerlist', adminAuth, getBannerList)
router.route('/addBanner')
  .get(getAddBanner)
  .post(upload2.single('image'), postAddBanner)

router.put('/disableBanner/:id', putDisableBanner)
router.route('/editBanner/:id')
  .get(getEditBanner)
  .post(upload2.single('image'), postEditBanner)

module.exports = router
