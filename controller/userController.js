const { userSignUp, userLogin, viewProducts, viewSingleProduct, doOTPLogin, verifyOTP, addToCart, getCartProducts, getCartCount, updateQuantity, deleteCartProduct, getCartTotal, addAddress, getAllAddresses, changeDefaultAddress, getDefaultAddress, placeOrderHelper, removeCartProducts, getCartDetails, getOrderDetails, cancelOrder, getOrderProducts, generateRazorpayOrder, verifyPayment, changePaymentStatus, getUserDetails, editUserDetails, viewCoupons, selectCouponHelper, getBanners, validateCoupon, changePassword, walletPayment } = require('../helper/user-helper')

module.exports = {

  userAuth: (req, res, next) => {
    if (req.session.user) {
      next()
    } else {
      res.redirect('/login')
    }
  },

  getHome: async (req, res) => {
    let cartCount = null
    const banners = await getBanners()
    if (req.session.user) {
      const user = req.session.user
      cartCount = await getCartCount(req.session.user._id)
      res.render('user/index', { user, cartCount, banners })
    }
    res.render('user/index', { banners })
  },

  getCart: (req, res) => {
    const user = req.session.user
    let cartCount = null
    getCartProducts(user._id).then(async (response) => {
      const products = response.cartProducts
      const cartId = response._id
      cartCount = await getCartCount(req.session.user._id)
      getCartTotal(user._id).then((total) => {
        res.render('user/cart', { user, products, cartCount, cartId, total })
      })
    }).catch(() => {
      const error = 'Your cart is empty'
      cartCount = 0
      const total = 0
      res.render('user/cart', { user, cartCount, total, error })
    })
  },

  getCheckout: async (req, res) => {
    const user = req.session.user
    const userDetails = await getUserDetails(user._id)
    const cartCount = await getCartCount(user._id)
    const coupons = await viewCoupons()
    getDefaultAddress(user).then((response) => {
      if (response) {
        const address = response.addresses[0]
        getAllAddresses(user._id).then((response) => {
          const savedAddress = response.addresses
          getCartProducts(user._id).then((response) => {
            getCartTotal(user._id).then((total) => {
              const products = response.cartProducts
              res.render('user/checkout', { user, cartCount, address, savedAddress, total, products, coupons, userDetails })
            })
          }).catch(() => {
            res.redirect('/shop')
          })
        })
      } else {
        const address = []
        const savedAddress = null
        getCartTotal(user._id).then((total) => {
          res.render('user/checkout', { user, cartCount, address, savedAddress, total })
        })
      }
    })
  },

  getWishlist: async (req, res) => {
    let cartCount = null
    if (req.session.user) {
      const user = req.session.user
      cartCount = await getCartCount(user._id)
      res.render('user/wishlist', { user, cartCount })
    }
    res.render('user/wishlist')
  },

  getShop: async (req, res) => {
    let cartCount = null
    if (req.session.user) {
      const user = req.session.user
      cartCount = await getCartCount(user._id)
      viewProducts().then((response) => {
        const products = response
        res.render('user/shop', { user, products, cartCount })
      })
    } else {
      viewProducts().then((response) => {
        const products = response
        res.render('user/shop', { products })
      })
    }
  },

  getProduct: (req, res) => {
    const id = req.params.id
    viewSingleProduct(id).then(async (response) => {
      const product = response
      let cartCount = null
      if (req.session.user) {
        const user = req.session.user
        cartCount = await getCartCount(user._id)
        res.render('user/product', { user, product, cartCount })
      } else {
        res.render('user/product', { product })
      }
    }).catch(() => {
      res.redirect('/shop')
    })
  },

  getSignup: (req, res) => {
    res.render('user/signup')
  },

  getLogin: (req, res) => {
    if (req.session.user) { res.redirect('/') }
    res.render('user/login')
  },

  postSignup: (req, res) => {
    userSignUp(req.body).then((response) => {
      req.session.user = response
      res.redirect('/')
    }).catch(() => {
      const exists = 'User already exists'
      res.render('user/signup', { exists })
    })
  },

  postLogin: (req, res) => {
    userLogin(req.body).then((response) => {
      req.session.user = response.user
      res.redirect('/')
    }).catch(() => {
      const invalid = 'Invalid E-mail or Password'
      res.render('user/login', { invalid })
    })
  },

  getProfile: async (req, res) => {
    const user = req.session.user
    const userDetails = await getUserDetails(user._id)
    const cartCount = await getCartCount(user._id)
    const defaultAddress = await getDefaultAddress(user._id)
    getAllAddresses(user._id).then((response) => {
      const savedAddress = response.addresses
      res.render('user/dash', { user, cartCount, savedAddress, userDetails, defaultAddress })
    }).catch(() => {
      const savedAddress = []
      res.render('user/dash', { user, cartCount, savedAddress, userDetails })
    })
  },

  getNumber: (req, res) => {
    res.render('user/otplogin')
  },

  postNumber: (req, res) => {
    const number = req.body.number
    req.session.number = req.body.number
    doOTPLogin(number).then((response) => {
      res.render('user/otpverify', { response })
    }).catch(() => {
      const invalid = 'Invalid Number'
      res.render('user/otplogin', { invalid })
    })
  },

  postOTP: (req, res) => {
    const number = req.session.number
    const otp = req.body.OTP
    verifyOTP(number, otp).then((response) => {
      if (response.valid) {
        req.session.user = response.user
        res.redirect('/login')
      } else {
        const invalid = 'Enter Correct OTP'
        res.render('user/otpverify', { invalid })
      }
    })
  },

  addCart: (req, res) => {
    const userId = req.session.user._id
    const productId = req.params.id
    addToCart(userId, productId).then((response) => {
      getCartCount(userId).then((count) => {
        res.json({ status: true, cartCount: count })
      })
    })
  },

  getLogout: (req, res) => {
    req.session.user = null
    res.redirect('/')
  },

  changeProductQuantity: (req, res) => {
    updateQuantity(req.body).then(() => {
      res.json({ status: true })
    })
  },

  deleteCartItem: (req, res) => {
    const userId = req.session.user._id
    const productId = req.params.id
    deleteCartProduct(userId, productId).then(() => {
      res.redirect('/cart')
    })
  },
  getAddAddress: async (req, res) => {
    const user = req.session.user
    const cartCount = await getCartCount(req.session.user._id)
    res.render('user/addAddress', { user, cartCount })
  },

  postAddAddress: (req, res) => {
    const user = req.session.user._id
    const address = req.body
    addAddress(user, address).then(() => {
      res.redirect('/profile')
    }).catch(() => {
      const invalid = 'Address already exists'
      res.render('user/addAddress', { user, invalid })
    })
  },

  changeAddress: (req, res) => {
    const addressId = req.params.id
    const userId = req.session.user._id
    changeDefaultAddress(userId, addressId).then(() => {
      res.redirect('back')
    })
  },

  placeOrder: (req, res) => {
    const order = req.body
    const user = req.session.user
    getCartProducts(user._id).then(async (response) => {
      const productIds = await getCartDetails(user._id)
      placeOrderHelper(user._id, order, productIds).then((orderId) => {
        removeCartProducts(user._id).then(() => {
          if (order.paymentOption === 'COD') {
            res.json({ paymentOption: 'COD' })
          } else if (order.paymentOption === 'Razorpay') {
            generateRazorpayOrder(orderId, order.total).then((response) => {
              res.json(response)
            })
          } else {
            walletPayment(orderId, order.total, user._id).then((response) => {
              res.json({ paymentOption: 'Wallet' })
            })
          }
        })
      })
    })
  },

  removeCartItems: (req, res) => {
    removeCartProducts(req.session.user._id).then(() => {
      res.redirect('/cart')
    })
  },

  getOrderHistory: async (req, res) => {
    if (req.session.user) {
      const user = req.session.user
      const cartCount = await getCartCount(user._id)
      getOrderDetails(user._id).then((orderDetails) => {
        res.render('user/order-history', { user, cartCount, orderDetails })
      })
    }
  },

  putCancelOrder: (req, res) => {
    const id = req.params.id
    const status = req.body.status
    const userId = req.body.id
    cancelOrder(id, status, userId).then(() => {
      res.json({})
    })
  },

  singleOrderDetails: async (req, res) => {
    const user = req.session.user
    const orderId = req.params.id
    const cartCount = await getCartCount(user._id)
    getOrderProducts(user._id, orderId).then((response) => {
      const userDetails = response.orderDetails.userId
      const addressDetails = response.orderDetails
      const products = response.products
      res.render('user/order-details', { user, cartCount, userDetails, addressDetails, products })
    })
  },

  getOrderPlaced: (req, res) => {
    const user = req.session.user
    const cartCount = 0
    res.render('user/order-placed', { user, cartCount })
  },

  postRazorpay: (req, res) => {
    verifyPayment(req.body).then(() => {
      changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch(() => {
      res.json({ status: false })
    })
  },

  editUser: (req, res) => {
    const user = req.session.user
    const userDetails = req.body
    editUserDetails(user._id, userDetails).then(() => {
      res.redirect('/profile')
    })
  },

  selectCoupon: (req, res) => {
    const id = req.body.id
    const user = req.session.user._id
    selectCouponHelper(id, user).then((coupon) => {
      res.json({ coupon, status: true })
    }).catch((invalid) => {
      res.json({ invalid, status: false })
    })
  },

  postValidateCoupon: (req, res) => {
    const code = req.body.code
    const user = req.session.user._id
    validateCoupon(code, user).then((coupon) => {
      res.json({ coupon, status: true })
    }).catch((invalid) => {
      res.json({ invalid, status: false })
    })
  },

  getForgotPassword: (req, res) => {
    res.render('user/forgot-password')
  },

  postForgotPassword: (req, res) => {
    const number = req.body.number
    req.session.number = number
    doOTPLogin(number).then((response) => {
      res.render('user/forgot-otp', { response })
    }).catch(() => {
      const invalid = 'Invalid Number'
      res.render('user/forgot-password', { invalid })
    })
  },

  postForgotOtp: (req, res) => {
    const number = req.session.number
    const otp = req.body.OTP
    verifyOTP(number, otp).then((response) => {
      if (response.valid) {
        res.render('user/change-password')
      } else {
        const invalid = 'Enter Correct OTP'
        res.render('user/forgot-otp', { invalid })
      }
    })
  },

  postPasswordChange: (req, res) => {
    const password = req.body.newPass
    const number = req.session.number
    changePassword(password, number).then((response) => {
      res.redirect('/login')
    })
  }
}
