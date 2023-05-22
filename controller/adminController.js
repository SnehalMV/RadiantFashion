/* eslint-disable no-unused-vars */
const layout = 'layouts/adminLayout'
const express = require('express')
const { viewUsers, adminLogin, blockUser, addCategory, viewCategories, disableCategory, getOrderHistory, viewCoupons, addCoupon, editCoupon, setCoupon, deleteCoupon, changeOrderStatus, addBannerHelper, getBanners, changeBannerStatus, editBanner, setBanner, getSalesPerMonth } = require('../helper/admin-helper')
const { addProduct, viewProducts, editProduct, setProduct, deleteProduct } = require('../helper/product-helper')
const moment = require('moment')

module.exports = {

  // Middleware for Admin Authentication
  adminAuth: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin')
    }
  },

  // Display Admin Login
  getAdminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    } else {
      res.render('admin/login', { layout: false })
    }
  },

  // Display Dashboard
  getDash: async (req, res) => {
    const sales = await getSalesPerMonth()
    getOrderHistory().then((response) => {
      const orderDetails = response
      res.render('admin/index', { layout, orderDetails, sales })
    })
  },

  // Display Add Product Page
  getAddProducts: (req, res) => {
    viewCategories().then((response) => {
      const categories = response
      res.render('admin/addProduct', { layout, categories })
    }).catch(() => {
      res.render('admin/addProduct', { layout })
    })
  },

  // Display Table of All Products
  getViewProducts: (req, res) => {
    viewProducts().then((response) => {
      const products = response
      res.render('admin/viewProducts', { layout, products })
    }).catch(() => {
      res.render('admin/viewProducts', { layout })
    })
  },

  // Display Table of All Users
  getUserList: (req, res) => {
    viewUsers().then((response) => {
      const users = response
      res.render('admin/viewUser', { layout, users })
    }).catch(() => {
      res.render('admin/viewUser', { layout })
    })
  },

  // Call User Block Function
  putBlockUser: (req, res) => {
    const userId = req.params.id
    blockUser(userId, res)
  },

  // Controller to Intiate Session after Admin Login
  postAdminLogin: (req, res) => {
    adminLogin(req.body).then((response) => {
      req.session.admin = response.adminUser
      res.redirect('/admin/dashboard')
    }).catch(() => {
      const invalid = 'Invalid Admin Details'
      res.render('admin/login', { layout: false, invalid })
    })
  },

  // Controller to Add Product to Database
  postAddProducts: (req, res) => {
    const files = req.files
    const filename = files.map((file) => {
      return file.filename
    })
    addProduct(req.body, filename).then(() => {
      res.redirect('/admin/products')
    }).catch(() => {
      res.redirect('/admin/addProduct')
    })
  },

  // Display Edit Product Page
  getEditProduct: (req, res) => {
    const id = req.params.id
    editProduct(id).then((response) => {
      const product = response
      viewCategories().then((response) => {
        const categories = response
        res.render('admin/editProduct', { layout, product, categories })
      }).catch(() => {
        res.render('admin/editProduct', { layout, product })
      })
    })
  },

  // Controller to Edit Product within Database with Product ID
  postEditProduct: (req, res) => {
    const product = req.body
    const id = req.params.id
    let images
    if (!req.files) {
      images = null
    } else {
      const fileNames = req.files
      images = fileNames.map(file => file.filename)
    }
    setProduct(product, id, images).then(() => {
      res.redirect('/admin/products')
    }).catch(() => {
      res.redirect('/admin/editProduct/' + id)
    })
  },

  // Admin Logout
  getLogout: (req, res) => {
    req.session.admin = null
    res.redirect('/admin')
  },

  // Controller to Soft Delete Product
  getDeleteProduct: (req, res) => {
    const id = req.params.id
    deleteProduct(id).then(() => {
      res.redirect('/admin/products')
    })
  },

  // Display Table of All Categories
  getCategoryList: (req, res) => {
    viewCategories().then((categories) => {
      res.render('admin/viewCategory', { layout, categories })
    }).catch(() => {
      res.render('admin/viewCategory', { layout })
    })
  },

  // Display Add Categories
  getAddCategory: (req, res) => {
    res.render('admin/addCategory', { layout })
  },

  // Controller to Add Category To Database
  postAddCategory: (req, res) => {
    const category = req.body.name
    addCategory(category).then((addedCat) => {
      res.redirect('/admin/categorylist')
    }).catch(() => {
      const invalid = 'Category Already Exists'
      res.render('admin/addCategory', { layout, invalid })
    })
  },

  // Controller to Disable Categories
  putDisableCategory: (req, res) => {
    const id = req.params.id
    disableCategory(id, res)
  },

  // Display Table of All Orders
  getOrderList: (req, res) => {
    getOrderHistory().then((response) => {
      const orderDetails = response
      res.render('admin/order-list', { layout, orderDetails })
    })
  },

  // Display Table of All Coupons
  getCouponList: (req, res) => {
    viewCoupons().then((response) => {
      const coupons = response
      res.render('admin/coupon-list', { layout, coupons })
    }).catch(() => {
      res.render('admin/coupon-list', { layout })
    })
  },

  // Display Add Coupon Page
  getAddCoupon: (req, res) => {
    res.render('admin/addCoupon', { layout })
  },

  // Controller to Add Coupon to Database
  postAddCoupon: (req, res) => {
    const coupon = req.body
    addCoupon(coupon).then((response) => {
      res.redirect('/admin/couponlist')
    }).catch(() => {
      const invalid = 'Coupon Code Already Exists'
      res.render('admin/addCoupon', { invalid })
    })
  },

  // Display Edit Coupon Page
  getEditCoupon: (req, res) => {
    const id = req.params.id
    editCoupon(id).then((response) => {
      const coupon = response
      res.render('admin/editCoupon', { layout, coupon })
    }).catch(() => {
      res.redirect('/admin/couponlist')
    })
  },

  // Controller to Edit Coupon within Database with Coupon ID
  postEditCoupon: (req, res) => {
    const id = req.params.id
    const coupon = req.body
    setCoupon(id, coupon).then((response) => {
      res.redirect('/admin/couponlist')
    })
  },

  // Controller to Delete Coupon
  putDeleteCoupon: (req, res) => {
    const id = req.params.id
    deleteCoupon(id).then(() => {
      res.json({ status: true })
    })
  },

  // Controler to Change Order Status
  postChangeOrderStatus: (req, res) => {
    const status = req.body.status
    const id = req.body.orderId
    const userId = req.body.id
    changeOrderStatus(id, status, userId).then(() => {
      res.json({ status: true })
    })
  },

  // Display Table of All Banners
  getBannerList: (req, res) => {
    getBanners().then((response) => {
      const banners = response
      res.render('admin/banner-list', { layout, banners })
    })
  },

  // Display Add Banner Page
  getAddBanner: (req, res) => {
    res.render('admin/addBanner', { layout })
  },

  // Controller to Add Banner to Database
  postAddBanner: (req, res) => {
    const banner = req.body
    const image = req.file.filename
    addBannerHelper(banner, image).then(() => {
      res.redirect('/admin/bannerlist')
    })
  },

  // Disable Banner
  putDisableBanner: (req, res) => {
    const id = req.params.id
    changeBannerStatus(id).then((status) => {
      res.json(status)
    })
  },

  // Display Edit Banner Page
  getEditBanner: (req, res) => {
    const id = req.params.id
    editBanner(id).then((banner) => {
      res.render('admin/editBanner', { layout, banner })
    })
  },

  // Controller to Edit Banner within Database with Banner ID
  postEditBanner: (req, res) => {
    const id = req.params.id
    const image = req.file.filename
    setBanner(id, req.body, image).then(() => {
      res.redirect('/admin/bannerlist')
    })
  }
}
