const express 			= require('express');
const router 			= express.Router();

const UserController 	= require('../controllers/user.controller');
const UploadController  = require('../controllers/upload.controller');
const path              = require('path');
const multer = require('multer');
const {checkToken}	    = require('../middlewares/auth.js')


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname )
  }
})

const multerupload = multer({ 
	storage: storage ,
	// allow only selected file types
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.pdf') {
            return callback(new Error('Only selected file types are allowed'))
        }
        callback(null, true)
    }
})

router.get('/', function(req, res, next) {
  res.json({status:"success", data:{"version_number":"v1.0.0"}})
});

router.post('/user', UserController.create);                                                    // C
router.post('/user/login', UserController.login);
router.get('/user', checkToken ,UserController.userInfo);



router.post('/fileupload',checkToken,multerupload.any(),UploadController.fileupload);


module.exports = router;
