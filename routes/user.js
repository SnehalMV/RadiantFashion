const { userAuth, getHome, getCart, getCheckout, getWishlist, getShop, getProduct, getSignup, getLogin, getProfile, getLogout, postSignup, postLogin, getNumber, postNumber, postOTP, addCart, changeProductQuantity, deleteCartItem, getAddAddress, postAddAddress, changeAddress, placeOrder, removeCartItems, getOrderHistory, putCancelOrder, singleOrderDetails, getOrderPlaced, postRazorpay, editUser, selectCoupon, postValidateCoupon, getForgotPassword, postForgotPassword, postForgotOtp, postPasswordChange } = require('../controller/userController')
const express = require('express')
const router = express.Router()

// Routes for User
router.get('/', getHome)
router.get('/cart', userAuth, getCart)
router.get('/checkout', userAuth, getCheckout)
router.get('/wishlist', getWishlist)
router.get('/shop', getShop)
router.get('/product/:id', getProduct)
router.route('/signup')
  .get(getSignup)
  .post(postSignup)

router.route('/login')
  .get(getLogin)
  .post(postLogin)

router.route('/otplogin')
  .get(getNumber)
  .post(postNumber)

router.post('/otpverify', postOTP)
router.get('/profile', userAuth, getProfile)
router.get('/add-to-cart/:id', userAuth, addCart)
router.post('/change-product-quantity', changeProductQuantity)
router.get('/deleteCartItem/:id', deleteCartItem)
router.get('/remove-cart', removeCartItems)
router.route('/add-address')
  .get(userAuth, getAddAddress)
  .post(postAddAddress)

router.get('/change-address/:id', changeAddress)
router.post('/place-order', userAuth, placeOrder)
router.get('/logout', getLogout)
router.get('/order-history', getOrderHistory)
router.get('/order-details/:id', userAuth, singleOrderDetails)
router.get('/orderplaced', userAuth, getOrderPlaced)
router.put('/cancel-order/:id', putCancelOrder)
router.post('/verify-payment', postRazorpay)
router.post('/edit-user', editUser)
router.post('/select-coupon', selectCoupon)
router.post('/validate-coupon', postValidateCoupon)
router.route('/forgot-password')
  .get(getForgotPassword)
  .post(postForgotPassword)

router.post('/forgot-otp', postForgotOtp)
router.post('/change-passwordF', postPasswordChange)

module.exports = router
