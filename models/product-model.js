/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
const mongoose = require('mongoose')

try {
  const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    Images: {
      type: Array,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  })
  module.exports = mongoose.model('product', productSchema)
} catch (error) {
  console.log(error.message)
}
