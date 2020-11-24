const User = require('../models/auth.model')
const expressJwt = require('express-jwt')
const lodash = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const fetch = require('node-fetch')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
// custom error handler to get useful errors from database errors
const { errorHandler } = require('../helpers/dbErrorhandling')
const sgMail = require('@sendgrid/mail')


exports.registerController = (req, res) => {
    const { name, email, password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    error: "Email already taken"
                })
            }
        })

        // generate token
        const token = jwt.sign({
            name,
            email,
            password
        },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: "15m"
            }
        )

        // Email data for sending mail
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Account activation link',
            html: `
                <h3>Please click on the below link to activate your account.</h3>
                <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                <hr />
                <p>This email contains sensitive information </p>
                <p>${process.env.CLIENT_URL}</p>
            `
        }

        sgMail.setApiKey(process.env.MAIL_KEY)
        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `A mail has been sent to ${email}`
            })
        }).catch(err => {
            return res.status(400).json({
                error: errorHandler(err)
            })
        })
    }
}

// activation and save to database
exports.activationController = (req, res) => {
    const { token } = req.body

    if (token) {
        // verify if the token has expired or is it valid
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    error: 'Token has been expired. Sign up again.'
                })
            } else {
                //if valid token then save to database
                // get name, email, password from the token
                const { name, email, password } = jwt.decode(token)

                const user = new User({
                    name,
                    email,
                    password
                })

                user.save((err, user) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err)
                        })
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: 'Signup successful',
                        })
                    }
                })
            }
        })
    } else {
        return res.json({
            message: 'Some error occured. Please try again.'
        })
    }
}

// login controller
exports.loginController = (req, res) => {
    const { email, password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with this email-id doesnot exit, please Sign up'
                })
            }

            // authenticating password
            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: 'Wrong Password'
                })
            }

            // generate token
            const token = jwt.sign(
                {
                    _id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h'
                }
            )

            const { _id, name, email, role } = user
            return res.json({
                token,
                user: {
                    _id,
                    name,
                    email,
                    role
                }
            })
        })
    }
}

// forget password controller
exports.forgetPasswordController = (req, res) => {
    const { email } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({ email }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with this email doesnot exists.'
                })
            }
            // if user exists generate token for that user.
            const token = jwt.sign({
                _id: user._id
            },
                process.env.JWT_RESET_PASSWORD,
                {
                    expiresIn: '15m'
                }
            )

            // send email with this token
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Password reset link',
                html: `
                    <h3>Please click on the below link to reset your password.</h3>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email contains sensitive information </p>
                    <p>${process.env.CLIENT_URL}</p>
                `
            }

            return user.updateOne({
                resetPasswordLink: token
            }, (err, success) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                } else {
                    sgMail.setApiKey(process.env.MAIL_KEY)
                    sgMail.send(emailData).then(sent => {
                        return res.json({
                            message: `A mail has been sent to ${email}`
                        })
                    }).catch(err => {
                        return res.status(400).json({
                            error: err.message
                        })
                    })
                }
            })
        })
    }
}

// reset password
exports.resetPasswordController = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body
    //console.log(newPassword, resetPasswordLink);
    const errors = validationResult(req)

    if (!errors.isEmpty()) {

        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {

        if (resetPasswordLink) {

            jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
                if (err) {
                    return res.status(400).json({
                        error: 'Expired link, please try again'
                    })
                }
                //console.log('asd');
                User.findOne({ resetPasswordLink }).exec((err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: 'Something went wrong. Try later'
                        })
                    }


                    return user.updateOne({
                        password: newPassword,
                        resetPasswordLink: ''
                    }, (err, success) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        } else {
                            return res.json({
                                message: 'Great! Now you can login with your new password'
                            })
                        }
                    })
                })
            })

        }
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT)
exports.googleController = (req, res) => {
    //destructuring token from the request body
    const { idToken } = req.body

    // verifying the token
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
        .then(response => {
            console.log(response);
            const { email_verified, name, email } = response.payload

            // check if email verified
            if (email_verified) {
                // check if the user exists in the database
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({
                            _id: user._id
                        }, process.env.JWT_SECRET,{
                            expiresIn: '7d'
                        })

                        const {_id, email, name, role} = user
                        // send response to the client side (token and the user details)
                        return res.json({
                            token,
                            user: {_id, email, name, role}
                        })
                    }else{
                        // if no user is found then create one in database
                        let password = email+process.env.JWT_SECRET;
                        user = new User({name, email, password})
                        user.save((err, data) => {
                            if(err){
                                return res.status(400).json({
                                    error: errorHandler(err)
                                })
                            }
                            // if no error is found create token
                            const token = jwt.sign(
                                {_id: data._id},
                                process.env.JWT_SECRET,
                                {expiresIn: '7d'}
                            )

                            const {_id, name, email, role} = data
                            return res.json({
                                token,
                                user: {_id, name, email, role}
                            })
                            
                        })
                    }
                })
            }else{
                return res.status(400).json({
                    error: 'Google login failed, please try again.'
                })
            }
        })

}