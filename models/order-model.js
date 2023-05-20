const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'user'
  },

  addressLine: {
    type: String,
    required: true
  },

  town: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  pincode: {
    type: Number,
    required: true
  },

  products: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: 'product'
      },
      quantity: Number
    }
  ],

  paymentOption: {
    type: String
  },

  couponOff: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String
  }
})
module.exports = mongoose.model('order', orderSchema)
