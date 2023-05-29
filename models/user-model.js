/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
const mongoose = require('mongoose')
const db = require('../config/connection')
const bcrypt = require('bcrypt')

try {
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },

    number: {
      type: Number,
      required: true,
      unique: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,

      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: true
    }
  })

  module.exports = mongoose.model('user', userSchema)
} catch (error) {
  console.log(error.message)
}
