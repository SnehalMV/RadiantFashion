/* eslint-disable n/handle-callback-err */
/* eslint-disable eqeqeq */
/* eslint-disable no-useless-catch */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable new-cap */
const express = require('express')
const userModel = require('../models/user-model')
const productModel = require('../models/product-model')
const cartModel = require('../models/cart-model')
const addressModel = require('../models/address-model')
const orderModel = require('../models/order-model')
const couponModel = require('../models/coupon-model')
const bannerModel = require('../models/banner-model')
const bcrypt = require('bcrypt')
const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTHTOKEN
const verifySid = process.env.TWILIO_VERIFYSID
const client = require('twilio')(accountSid, authToken)
const Razorpay = require('razorpay')

const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEYID,
  key_secret: process.env.RAZOR_PAY_KEYSECRET
})

module.exports = {

  // Function to verify User Details and Add User to Database
  userSignUp: (user) => {
    return new Promise(async (resolve, reject) => {
      const emailExists = await userModel.findOne({ email: user.email })
      const numberExists = await userModel.findOne({ number: user.number })
      if (emailExists || numberExists) {
        reject()
      } else {
        user.password = await bcrypt.hash(user.password2, 10)
        const userDetails = new userModel({
          name: user.name,
          email: user.email,
          password: user.password,
          number: user.number
        })

        userDetails.save()
        resolve(userDetails)
      }
    }
    )
  },

  // Function to verify User Credentials 
  userLogin: (userData) => {
    return new Promise((resolve, reject) => {
      const response = {}
      userModel.findOne({ email: userData.email, status: true }).then((user) => {
        if (user) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              response.user = user
              resolve(response)
            } else {
              reject()
            }
          })
        } else {
          reject()
        }
      })
    })
  },

  // Bring all Products from Database 
  viewProducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await productModel.find({})
      if (products) {
        resolve(products)
      } else {
        reject()
      }
    })
  },

  // Bring a Single Product from Database using Product ID
  viewSingleProduct: (id) => {
    return new Promise((resolve, reject) => {
      productModel.findById(id).then((response) => {
        resolve(response)
      }).catch(() => {
        reject()
      })
    })
  },

  // Function to verify number and send OTP 
  doOTPLogin: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      userModel.findOne({ number: phoneNumber }).then((user) => {
        if (user) {
          client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+91${phoneNumber}`, channel: 'sms' })
            .then((response) => {
              const number = response.to
              resolve(number)
            })
        } else {
          reject()
        }
      })
    })
  },

  // Function to verify Entered OTP
  verifyOTP: (number, otp) => {
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
        .then(response => {
          const valid = response.valid
          userModel.findOne({ number }).then((user) => {
            resolve({ user, valid })
          })
        })
    })
  },

  // Function to add Product to Cart
  addToCart: (userIdParam, prodId) => {
    return new Promise((resolve, reject) => {
      const product = {
        productId: prodId,
        quantity: 1
      }
      cartModel.findOne({ userId: userIdParam }).then(async (exists) => {
        if (exists) {
          const prodExists = exists.cartProducts.findIndex(product => product.productId == prodId)
          if (prodExists != -1) {
            await cartModel.updateOne({ userId: userIdParam, 'cartProducts.productId': prodId }, {
              $inc: { 'cartProducts.$.quantity': 1 }
            })
            resolve()
          } else {
            await cartModel.updateOne({ userId: userIdParam },
              {
                $push: { cartProducts: product }
              })
            resolve()
          }
        } else {
          const newCart = new cartModel({
            userId: userIdParam,
            cartProducts: product

          })
          await newCart.save()
          resolve(newCart)
        }
      })
    })
  },

  // Function to retrieve all Products within Cart 
  getCartProducts: (userIdParam) => {
    return new Promise((resolve, reject) => {
      cartModel.findOne({ userId: userIdParam }).populate('cartProducts.productId').then((response) => {
        if (response) {
          if (response.cartProducts.length) {
            resolve(response)
          } else {
            reject()
          }
        } else {
          reject()
        }
      })
    })
  },

  // Function to return the count of Unique Products within Cart
  getCartCount: (id) => {
    return new Promise((resolve, reject) => {
      cartModel.findOne({ userId: id }).then((response) => {
        if (response) {
          const cartCount = response.cartProducts.length
          resolve(cartCount)
        } else {
          const cartCount = 0
          resolve(cartCount)
        }
      })
    })
  },

  // Function to change the quantity of Products within the Cart
  updateQuantity: (details) => {
    const count = parseInt(details.count)
    const quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
      if (count === -1 && quantity == 1) {
        cartModel.updateOne({ _id: details.cartId, 'cartProducts.productId': details.productId }, {
          $pull: { cartProducts: { productId: details.productId } }
        }).then(() => {
          resolve()
        })
      } else {
        cartModel.updateOne({ _id: details.cartId, 'cartProducts.productId': details.productId },
          { $inc: { 'cartProducts.$.quantity': count } }).then(() => {
          resolve()
        })
      }
    })
  },

  // Function to delete Cart Product
  deleteCartProduct: (userid, productid) => {
    return new Promise((resolve, reject) => {
      cartModel.updateOne({ userId: userid },
        {
          $pull: {
            cartProducts:
              { productId: productid }
          }
        }).then(() => {
        resolve()
      })
    })
  },

  // Function to return total of all Products within Cart
  getCartTotal: (id) => {
    return new Promise((resolve, reject) => {
      cartModel.findOne({ userId: id }).populate('cartProducts.productId').then((response) => {
        let total = 0
        if (response) {
          const products = response.cartProducts
          for (const product of products) {
            total += product.productId.price * product.quantity
          }
          resolve(total)
        } else {
          resolve(total)
        }
      })
    })
  },

  // Add Address to Database
  addAddress: (user, address) => {
    return new Promise((resolve, reject) => {
      const userAddress = {
        addressLine: address.addressLine,
        town: address.town,
        state: address.state,
        pincode: address.pincode
      }
      addressModel.findOne({ userId: user }).then((userExists) => {
        if (userExists) {
          addressModel.findOne({ userId: user, 'addresses.addressLine': address.addressLine }).then((addressExists) => {
            if (addressExists) {
              reject()
            } else {
              addressModel.updateOne({ userId: user, 'addresses.defaultAddress': true },
                { $set: { 'addresses.$.defaultAddress': false } })
                .then(async () => {
                  await addressModel.updateOne({ userId: user },
                    {
                      $push: { addresses: userAddress }
                    })
                  resolve()
                })
            }
          })
        } else {
          const newAddress = new addressModel({
            userId: user,
            addresses: userAddress
          })
          newAddress.save()
          resolve()
        }
      })
    })
  },

  // Retrieve all Addresses of an User 
  getAllAddresses: (user) => {
    return new Promise((resolve, reject) => {
      addressModel.findOne({ userId: user }).then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  // Change Default Status of User Addresses
  changeDefaultAddress: (user, address) => {
    return new Promise((resolve, reject) => {
      addressModel.updateOne({ userId: user, 'addresses.defaultAddress': true }, { $set: { 'addresses.$.defaultAddress': false } })
        .then(async () => {
          addressModel.updateOne({ userId: user, 'addresses._id': address }, { $set: { 'addresses.$.defaultAddress': true } }).then((response) => {
            resolve()
          })
        })
    })
  },

  // Function to retrieve Default Address of an User
  getDefaultAddress: (user) => {
    return new Promise((resolve, reject) => {
      addressModel.findOne({ userId: user, addresses: { $elemMatch: { defaultAddress: true } } }, { 'addresses.$': 1 })
        .then((response) => {
          if (response) {
            resolve(response)
          } else {
            resolve(null)
          }
        })
    })
  },

  // Function to add Order to Database
  placeOrderHelper: (user, order, productIds) => {
    return new Promise(async (resolve, reject) => {
      if (order.couponOff) {
        await couponModel.updateOne({
          code: order.couponCode
        }, {
          $push: {
            usedBy: user
          }
        })
      }
      const newOrder = new orderModel({
        userId: user,
        addressLine: order.addressLine,
        town: order.town,
        state: order.state,
        pincode: order.pincode,
        products: productIds,
        paymentOption: order.paymentOption,
        totalAmount: order.total,
        status: (order.paymentOption === 'COD' ? 'Placed' : 'Pending'),
        couponOff: order.couponOff
      })
      newOrder.save()
      resolve(newOrder._id)
    })
  },

  // Function to remove all Products from Cart
  removeCartProducts: (user) => {
    return new Promise((resolve, reject) => {
      cartModel.updateOne({ userId: user }, { $unset: { cartProducts: 1 } }).then(() => {
        resolve()
      })
    })
  },

  // Retrieve Details of all Products in Cart
  getCartDetails: (user) => {
    return new Promise((resolve, reject) => {
      const orderProducts = []
      cartModel.findOne({ userId: user }).then((response) => {
        for (let i = 0; i < response.cartProducts.length; i++) {
          const item = response.cartProducts[i]
          orderProducts.push({
            productId: item.productId, quantity: item.quantity
          })
        }
        resolve(orderProducts)
      })
    })
  },

  // Retrieve Order Details of a single Order
  getOrderDetails: (user) => {
    return new Promise((resolve, reject) => {
      orderModel.find({ userId: user }).populate('products.productId').populate('userId').then((response) => {
        resolve(response)
      })
    })
  },

  // Change Status of an Order to Either Cancelled or Returned
  cancelOrder: (id, oStatus, userId) => {
    return new Promise(async (resolve, reject) => {
      const order = await orderModel.findById(id)
      const wAmount = order.totalAmount
      if ((order.paymentOption === 'COD' && order.status === 'Delivered') || (order.paymentOption === 'Razorpay')) {
        await userModel.findByIdAndUpdate(userId,
          {
            $inc: { walletAmount: wAmount }
          })
      }
      orderModel.updateOne({ _id: id }, { $set: { status: oStatus } }).then(() => {
        resolve()
      })
    })
  },

  // Retrieve Product Details of a Single Order
  getOrderProducts: (user, order) => {
    return new Promise((resolve, reject) => {
      orderModel.findOne({ userId: user, _id: order }).populate('products.productId').populate('userId').then((response) => {
        const orderDetails = response
        const products = response.products.map(product => {
          return {
            product: product.productId,
            quantity: product.quantity
          }
        })
        resolve({ orderDetails, products })
      })
    })
  },

  // Generate Razorpay 
  generateRazorpayOrder: (orderId, total) => {
    return new Promise((resolve, reject) => {
      const options = {
        amount: parseInt(total) * 100,
        currency: 'INR',
        receipt: orderId.toString()
      }
      instance.orders.create(options, function (err, order) {
        resolve(order)
      })
    })
  },

  // Verify Payment using Razorpay
  verifyPayment: (orderDetails) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'fYTL5tTwSYxZg5yucb1ZTFVX')
      hmac.update(orderDetails['payment[razorpay_order_id]'] + '|' + orderDetails['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == orderDetails['payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }
    })
  },

  // Change Order Status after payment
  changePaymentStatus: (receipt) => {
    return new Promise((resolve, reject) => {
      orderModel.updateOne({ _id: receipt }, {
        $set: { status: 'Placed' }
      }).then(() => {
        resolve()
      })
    })
  },

  // Retrieve User Details
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      userModel.findById(userId).then((response) => {
        resolve(response)
      })
    })
  },

  // Edit User Details
  editUserDetails: (userId, details) => {
    return new Promise((resolve, reject) => {
      userModel.updateOne({ _id: userId }, {
        $set: {
          name: details.name,
          number: details.number,
          email: details.email
        }
      }).then(() => {
        resolve()
      })
    })
  },

  // Retrieve all Coupons and display them in a Div
  viewCoupons: () => {
    return new Promise((resolve, reject) => {
      couponModel.find({}).then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  // Helper Function to validate Coupon selected from couponDiv
  selectCouponHelper: (id, user) => {
    return new Promise((resolve, reject) => {
      couponModel.findById(id).then(async (response) => {
        if (response) {
          const used = await couponModel.findOne({ _id: id, usedBy: user })
          if (used) {
            const invalid = 'Coupon Already Used'
            reject(invalid)
          } else {
            if (response.expiry <= new Date()) {
              const invalid = 'Coupon Expired'
              reject(invalid)
            } else {
              resolve(response)
            }
          }
        } else {
          reject()
        }
      })
    })
  },

  // Retrieve all Banners from Database
  getBanners: () => {
    return new Promise((resolve, reject) => {
      bannerModel.find({ status: true }).then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  // Validate Coupon entered by User
  validateCoupon: (couponCode, user) => {
    return new Promise((resolve, reject) => {
      couponModel.findOne({ code: couponCode }).then(async (response) => {
        if (response) {
          const used = await couponModel.findOne({ code: couponCode, usedBy: user })
          if (used) {
            const invalid = 'Coupon Already Used'
            reject(invalid)
          } else {
            if (response.expiry <= new Date()) {
              const invalid = 'Coupon Expired'
              reject(invalid)
            } else {
              resolve(response)
            }
          }
        } else {
          const invalid = "Coupon Doesn't Exist"
          reject(invalid)
        }
      })
    })
  },

  // Function to Change User's Password
  changePassword: (newPass, pNumber) => {
    return new Promise(async (resolve, reject) => {
      const newPassword = await bcrypt.hash(newPass, 10)
      userModel.updateOne({ number: pNumber }, {
        $set: {
          password: newPassword
        }
      }).then((response) => {
        resolve(response)
      })
    })
  },

  // Payment using Wallet
  walletPayment: (id, total, userId) => {
    return new Promise(async (resolve, reject) => {
      await userModel.findByIdAndUpdate(userId,
        {
          $inc: { walletAmount: total * -1 }
        })
      resolve()
    })
  }
}
