const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
})

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/banners')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })
const upload2 = multer({ storage: storage2 })

module.exports = { upload, upload2 }
