/* eslint-disable no-unused-vars */
const layout = 'layouts/adminLayout'
const express = require('express')
const { viewUsers, adminLogin, blockUser, addCategory, viewCategories, disableCategory, getOrderHistory, viewCoupons, addCoupon, editCoupon, setCoupon, deleteCoupon, changeOrderStatus, addBannerHelper, getBanners, changeBannerStatus, editBanner, setBanner } = require('../helper/admin-helper')
const { addProduct, viewProducts, editProduct, setProduct, deleteProduct } = require('../helper/product-helper')

module.exports = {

  adminAuth: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin')
    }
  },

  getAdminLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    } else {
      res.render('admin/login', { layout: false })
    }
  },

  getDash: (req, res) => {
    getOrderHistory().then((response) => {
      const orderDetails = response
      res.render('admin/index', { layout, orderDetails })
    })
  },

  getAddProducts: (req, res) => {
    viewCategories().then((response) => {
      const categories = response
      res.render('admin/addProduct', { layout, categories })
    }).catch(() => {
      res.render('admin/addProduct', { layout })
    })
  },

  getViewProducts: (req, res) => {
    viewProducts().then((response) => {
      const products = response
      res.render('admin/viewProducts', { layout, products })
    }).catch(() => {
      res.render('admin/viewProducts', { layout })
    })
  },

  getUserList: (req, res) => {
    viewUsers().then((response) => {
      const users = response
      res.render('admin/viewUser', { layout, users })
    }).catch(() => {
      res.render('admin/viewUser', { layout })
    })
  },

  putBlockUser: (req, res) => {
    const userId = req.params.id
    blockUser(userId, res)
  },

  postAdminLogin: (req, res) => {
    adminLogin(req.body).then((response) => {
      req.session.admin = response.adminUser
      res.redirect('/admin/dashboard')
    }).catch(() => {
      const invalid = 'Invalid Admin Details'
      res.render('admin/login', { layout: false, invalid })
    })
  },

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

  getLogout: (req, res) => {
    req.session.admin = null
    res.redirect('/admin')
  },

  getDeleteProduct: (req, res) => {
    const id = req.params.id
    deleteProduct(id).then(() => {
      res.redirect('/admin/products')
    })
  },

  getCategoryList: (req, res) => {
    viewCategories().then((categories) => {
      res.render('admin/viewCategory', { layout, categories })
    }).catch(() => {
      res.render('admin/viewCategory', { layout })
    })
  },

  getAddCategory: (req, res) => {
    res.render('admin/addCategory', { layout })
  },

  postAddCategory: (req, res) => {
    const category = req.body.name
    addCategory(category).then((addedCat) => {
      res.redirect('/admin/categorylist')
    }).catch(() => {
      const invalid = 'Category Already Exists'
      res.render('admin/addCategory', { layout, invalid })
    })
  },

  putDisableCategory: (req, res) => {
    const id = req.params.id
    disableCategory(id, res)
  },

  getOrderList: (req, res) => {
    getOrderHistory().then((response) => {
      const orderDetails = response
      res.render('admin/order-list', { layout, orderDetails })
    })
  },

  getCouponList: (req, res) => {
    viewCoupons().then((response) => {
      const coupons = response
      res.render('admin/coupon-list', { layout, coupons })
    }).catch(() => {
      res.render('admin/coupon-list', { layout })
    })
  },

  getAddCoupon: (req, res) => {
    res.render('admin/addCoupon', { layout })
  },

  postAddCoupon: (req, res) => {
    const coupon = req.body
    addCoupon(coupon).then((response) => {
      res.redirect('/admin/couponlist')
    }).catch(() => {
      const invalid = 'Coupon Code Already Exists'
      res.render('admin/addCoupon', { invalid })
    })
  },

  getEditCoupon: (req, res) => {
    const id = req.params.id
    editCoupon(id).then((response) => {
      const coupon = response
      res.render('admin/editCoupon', { layout, coupon })
    }).catch(() => {
      res.redirect('/admin/couponlist')
    })
  },

  postEditCoupon: (req, res) => {
    const id = req.params.id
    const coupon = req.body
    setCoupon(id, coupon).then((response) => {
      res.redirect('/admin/couponlist')
    })
  },

  putDeleteCoupon: (req, res) => {
    const id = req.params.id
    deleteCoupon(id).then(() => {
      res.json({ status: true })
    })
  },

  postChangeOrderStatus: (req, res) => {
    const status = req.body.status
    const id = req.body.orderId
    const userId = req.body.id
    changeOrderStatus(id, status, userId).then(() => {
      res.json({ status: true })
    })
  },

  getBannerList: (req, res) => {
    getBanners().then((response) => {
      const banners = response
      res.render('admin/banner-list', { layout, banners })
    })
  },

  getAddBanner: (req, res) => {
    res.render('admin/addBanner', { layout })
  },

  postAddBanner: (req, res) => {
    const banner = req.body
    const image = req.file.filename
    addBannerHelper(banner, image).then(() => {
      res.redirect('/admin/bannerlist')
    })
  },

  putDisableBanner: (req, res) => {
    const id = req.params.id
    changeBannerStatus(id).then((status) => {
      res.json(status)
    })
  },

  getEditBanner: (req, res) => {
    const id = req.params.id
    editBanner(id).then((banner) => {
      res.render('admin/editBanner', { layout, banner })
    })
  },

  postEditBanner: (req, res) => {
    const id = req.params.id
    const image = req.file.filename
    setBanner(id, req.body, image).then(() => {
      res.redirect('/admin/bannerlist')
    })
  }
}
