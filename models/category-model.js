const mongoose = require('mongoose')

try {
  const categorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    active: {
      type: Boolean,
      default: true,
      required: true
    }
  })
  module.exports = mongoose.model('category', categorySchema)
} catch (error) {
  console.log(error)
}
