const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  addresses: [
    {
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
      defaultAddress: {
        type: Boolean,
        default: true
      }
    }
  ]
})

module.exports = mongoose.model('address', addressSchema)
