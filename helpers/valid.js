// Validation helpers
const { check } = require('express-validator')
const { min } = require('lodash')

//  validates registration fields
exports.validateRegister = [
    check('name', 'Name is required').notEmpty()
        .isLength({
            min: 4,
            max: 32
        }).withMessage('name must be between 3 to 32 characters'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('password must contain a number')
]

// validates login fields
exports.validateLogin = [
    check('email', 'Email is required').notEmpty().isEmail().withMessage('Must be a valid email address'),
    check('password', 'Password is required').notEmpty(),
    check('password').isLength({ min: 6 }).withMessage('Password must contain atleast 6 characters').matches(/\d/).withMessage('Password must contain a number')
]

// forget password
exports.validateForgetPassword = [
    check('email', 'Email is required').not().isEmpty().isEmail().withMessage('Must be a valid email address'),
]

// reset password
exports.validateResetPassword = [
    check('newPassword', 'Password is required').not().isEmpty().isLength({ min: 6 }).withMessage('Password must contain atleast 6 characters').matches(/\d/).withMessage('Password must contain a number')
]