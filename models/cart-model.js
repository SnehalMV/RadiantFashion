const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },

  cartProducts:
    [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'product'
        },
        quantity: Number
      }
    ]
})

module.exports = mongoose.model('cart', cartSchema)
