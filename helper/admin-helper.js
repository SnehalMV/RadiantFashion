/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
/* eslint-disable new-cap */
const express = require('express')
const mongoose = require('mongoose')
const userModel = require('../models/user-model')
const categoryModel = require('../models/category-model')
const orderModel = require('../models/order-model')
const couponModel = require('../models/coupon-model')
const bannerModel = require('../models/banner-model')

const adminUser = process.env.ADMIN_USER
const adminPass = process.env.ADMIN_PASS

module.exports = {

  adminLogin: (admin) => {
    return new Promise((resolve, reject) => {
      if (adminUser === admin.email && adminPass === admin.password) {
        resolve({ adminUser })
      } else {
        reject()
      }
    })
  },

  viewUsers: () => {
    return new Promise(async (resolve, reject) => {
      const users = await userModel.find({})
      if (users) {
        resolve(users)
      } else {
        reject()
      }
    })
  },

  blockUser: async (id, res) => {
    try {
      const user = await userModel.findOne({ _id: id })
      user.status = !user.status
      await user.save()
      res.status(202).json(user.status)
    } catch (error) {
      res.status(404)
    }
  },

  addCategory: (category) => {
    return new Promise((resolve, reject) => {
      categoryModel.findOne({ name: category }).then((exists) => {
        if (exists) {
          reject()
        } else {
          const newCategory = new categoryModel({
            name: category
          })
          newCategory.save()
          resolve(newCategory)
        }
      })
    })
  },

  viewCategories: () => {
    return new Promise((resolve, reject) => {
      categoryModel.find({}).then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  disableCategory: async (id, res) => {
    try {
      const category = await categoryModel.findOne({ _id: id })
      category.active = !category.active
      await category.save()
      res.status(202).json(category.active)
    } catch (error) {
      res.status(404)
    }
  },

  getOrderHistory: () => {
    return new Promise((resolve, reject) => {
      orderModel.find({}).populate('userId').then((response) => {
        const orderDetails = response
        resolve(orderDetails)
      })
    })
  },

  viewCoupons: () => {
    return new Promise((resolve, reject) => {
      couponModel.find({}).then((response) => {
        if (response) {
          for (const coupon of response) {
            if (coupon.expiry <= new Date()) { coupon.status = false }
          }
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  addCoupon: (coupon) => {
    return new Promise(async (resolve, reject) => {
      const exists = await couponModel.findOne({ code: coupon.code })
      if (exists) {
        reject()
      } else {
        const newCoupon = new couponModel({
          code: coupon.code,
          description: coupon.description,
          expiry: coupon.expiryDate,
          offerPercentage: coupon.percentage,
          minPrice: coupon.price,
          maxOff: coupon.maxOff,
          usedBy: []
        })
        await newCoupon.save()
        resolve()
      }
    })
  },

  editCoupon: (id) => {
    return new Promise((resolve, reject) => {
      couponModel.findById(id).then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  setCoupon: (id, coupon) => {
    return new Promise((resolve, reject) => {
      couponModel.findByIdAndUpdate(id, {
        $set: {
          code: coupon.code,
          description: coupon.description,
          expiry: coupon.expiryDate,
          offerPercentage: coupon.percentage,
          minPrice: coupon.price,
          maxOff: coupon.maxOff
        }
      }).then((response) => {
        resolve()
      })
    })
  },

  deleteCoupon: (id) => {
    return new Promise((resolve, reject) => {
      couponModel.findByIdAndDelete(id).then(() => {
        resolve()
      })
    })
  },

  changeOrderStatus: (id, orderStatus, userId) => {
    return new Promise(async (resolve, reject) => {
      const order = await orderModel.findById(id)
      const wAmount = order.totalAmount
      if ((order.paymentOption === 'COD' && order.status === 'Delivered') || (order.paymentOption === 'Razorpay')) {
        await userModel.findByIdAndUpdate(userId,
          {
            $inc: { walletAmount: wAmount }
          })
      }
      orderModel.findByIdAndUpdate(id, {
        $set: {
          status: orderStatus
        }
      }).then(async () => {
        resolve()
      })
    })
  },

  addBannerHelper: (banner, image) => {
    return new Promise((resolve, reject) => {
      bannerModel.findOne({ bannerName: banner.name }).then((exists) => {
        if (exists) {
          reject()
        } else {
          const bannerDetails = new bannerModel({
            bannerName: banner.name,
            bannerTitle: banner.title,
            bannerSubtitle: banner.subtitle,
            bannerImage: image
          })
          bannerDetails.save()
          resolve()
        }
      })
    })
  },

  getBanners: () => {
    return new Promise((resolve, reject) => {
      bannerModel.find().then((response) => {
        if (response) {
          resolve(response)
        } else {
          reject()
        }
      })
    })
  },

  changeBannerStatus: (bannerId) => {
    return new Promise(async (resolve, reject) => {
      const banner = await bannerModel.findOne({ _id: bannerId })
      banner.status = !banner.status
      const status = banner.status
      await banner.save()
      resolve(status)
    })
  },

  editBanner: (id) => {
    return new Promise((resolve, reject) => {
      bannerModel.findById(id).then((response) => {
        resolve(response)
      })
    })
  },

  setBanner: (id, banner, image) => {
    return new Promise((resolve, reject) => {
      bannerModel.findByIdAndUpdate(id, {
        $set: {
          bannerName: banner.name,
          bannerTitle: banner.title,
          bannerSubtitle: banner.subtitle,
          bannerImage: image
        }
      }).then(() => {
        resolve()
      })
    })
  }
}
