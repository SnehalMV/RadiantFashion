require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', true)
mongoose.set('strictPopulate', false)
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to mongoose'))

module.exports = db
