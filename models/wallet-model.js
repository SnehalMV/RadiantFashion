const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId
  },

  walletHistory: [
    {
      walletAmount: {
        type: Number,
        default: 0
      },

      creditDate: {
        type: Date
      }
    }
  ],

  totalAmount: {
    type: Number
  }

})

module.exports = mongoose.model('wallet', walletSchema)
