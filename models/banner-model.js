const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  bannerName: {
    type: String,
    unique: true
  },

  bannerTitle: {
    type: String
  },

  bannerSubtitle: {
    type: String
  },

  bannerImage: {
    type: String
  },

  status: {
    type: Boolean,
    default: true
  }
})

module.exports = mongoose.model('banner', bannerSchema)
