/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-async-promise-executor */
const productModel = require('../models/product-model')
const mongoose = require('mongoose')

module.exports = {
  addProduct: (product, fileName) => {
    return new Promise((resolve, reject) => {
      const newProduct = new productModel({
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        Images: fileName
      })
      newProduct.save()
      resolve()
    })
  },

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

  editProduct: (id) => {
    return new Promise((resolve, reject) => {
      productModel.findById(id).then((product) => {
        resolve(product)
      }).catch(() => {
        reject()
      })
    })
  },

  setProduct: (product, id, images) => {
    return new Promise(async (resolve, reject) => {
      try {
        const existingProduct = await productModel.findById(id)
        const updateFields = {
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          Images: existingProduct.Images
        }

        if (images && images.length > 0) {
          updateFields.Images = images
        }

        await productModel.updateOne({ _id: id }, { $set: updateFields })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      productModel.updateOne({ _id: id },
        {
          $set:
        {
          quantity: 0
        }
        }).then(() => {
        resolve()
      })
    })
  }
}
