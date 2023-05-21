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

  //  Helper to Verify Admin Authentication
  adminLogin: (admin) => {
    return new Promise((resolve, reject) => {
      if (adminUser === admin.email && adminPass === admin.password) {
        resolve({ adminUser })
      } else {
        reject()
      }
    })
  },

  // Helper to List All Users in Database
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

  // Block User Function
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

  // Add Category to Database
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

  // Helper to List All Categories in Database
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

  // Disable Category Function
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

  // Display All Orders in Database
  getOrderHistory: () => {
    return new Promise((resolve, reject) => {
      orderModel.find({}).populate('userId').then((response) => {
        const orderDetails = response
        resolve(orderDetails)
      })
    })
  },

  // Helper to List All Coupons in Database
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

  // Add Coupon in Database
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

  // Helper to retrieve Coupon for Edit Using Coupon ID
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

  // Helper to Edit Coupon in Database using Coupon ID
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

  // Delete Coupon Function
  deleteCoupon: (id) => {
    return new Promise((resolve, reject) => {
      couponModel.findByIdAndDelete(id).then(() => {
        resolve()
      })
    })
  },

  // Helper to Change Order Status using Order ID
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

  // Add Banner in Database
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

  // Helper to List all Banners in Database
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

  // Disable Banner Function
  changeBannerStatus: (bannerId) => {
    return new Promise(async (resolve, reject) => {
      const banner = await bannerModel.findOne({ _id: bannerId })
      banner.status = !banner.status
      const status = banner.status
      await banner.save()
      resolve(status)
    })
  },

  // Helper to retrieve Banner to edit using Banner ID
  editBanner: (id) => {
    return new Promise((resolve, reject) => {
      bannerModel.findById(id).then((response) => {
        resolve(response)
      })
    })
  },

  // Helper to Edit Banner in Darabase using Banner ID
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
