const express = require('express');
const router = express.Router();

// load validation
const { validateRegister, validateLogin, validateResetPassword, validateForgetPassword } = require('../helpers/valid')

// load controller
const { registerController, activationController, loginController, forgetPasswordController, resetPasswordController, googleController } = require('../controllers/auth.controller.js');
const { viewProfileController, editProfileController, viewPostControler, likePostControler, removePostController } = require('../controllers/project_insta.controller')

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);
router.post('/password/forget', validateForgetPassword, forgetPasswordController);
router.post('/password/reset', validateResetPassword, resetPasswordController);
router.post('/activation', activationController);

//routes for google and facebook login
router.post('/googlelogin', googleController);



// instagram copy project api's
router.post('/users/profile', viewProfileController);
router.post('/users/profile/edit', editProfileController);
router.post('/users/post/view', viewPostControler);
router.post('/users/post/like', likePostControler);
router.post('/users/post/remove', removePostController);

module.exports = router;