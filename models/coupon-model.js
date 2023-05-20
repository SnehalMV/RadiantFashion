const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true
  },

  description: {
    type: String
  },

  expiry: {
    type: Date
  },

  offerPercentage: {
    type: Number
  },

  minPrice: {
    type: Number
  },

  maxOff: {
    type: Number
  },

  status: {
    type: Boolean,
    default: true
  },

  usedBy: [
    {
      type: String
    }
  ]
})

module.exports = mongoose.model('coupon', couponSchema)
