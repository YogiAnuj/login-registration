const User = require('../models/auth.model')
const Post = require('../models/post.model')
const expressJwt = require('express-jwt')
const lodash = require('lodash')
const fetch = require('node-fetch')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
// custom error handler to get useful errors from database errors
const { errorHandler } = require('../helpers/dbErrorhandling')


// controller for viewing any profile
exports.viewProfileController = (req, res) => {
    const { _id } = req.body
    //console.log(_id);
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({ _id }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'User with this id doesnot exit, please Sign up'
                })
            }
            const { _id, name, post_id, bio, follow, profile_pic } = user
            let post_count, follower_count, following_count
            if (post_id) {
                post_count = post_id.split(',').length
            } else {
                post_count = '0'
            }
            if (follow.follower) {
                follower_count = follow.follower.split(',').length
            } else {
                follower_count = '0'
            }
            if (follow.following) {
                following_count = follow.following.split(',').length
            } else {
                following_count = '0'
            }
            return res.json({
                user: {
                    _id,
                    name,
                    post_count,
                    bio,
                    profile_pic,
                    follower_count,
                    following_count
                }
            })
        })
    }

}

// controller for editing profile
exports.editProfileController = (req, res) => {
    const { name, bio, profile_pic } = req.body
    const token = req.header("x-auth-token");
    // to check if token is recieved
    /* return res.json({
        token
    }); */

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                return res.status(400).json({
                    error: 'Token has been expired. Sign In again.'
                })
            } else {
                const { _id } = jwt.decode(token)
                //console.log(_id);
                User.findOne({ _id }).exec((err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: 'Something went wrong, please try once again.'
                        })
                    }
                    return user.updateOne({
                        _id,
                        name,
                        bio,
                        profile_pic
                    }, (err, success) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        } else {
                            return res.json({
                                message: 'Profile updated successfully'
                            })
                        }
                    })
                })
            }

        })

    }

}

// controller for viewing a post
exports.viewPostControler = (req, res) => {
    const { _id, post_id } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        Post.findOne({ post_id }).exec((err, post) => {
            if (err || !post) {
                return res.status(400).json({
                    error: 'No such post found'
                })
            }
            return res.json({
                post
            })
        })
    }
}

// controller for liking a post
exports.likePostControler = (req, res) => {
    const { _id, post_id } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        Post.findOne({ post_id }).exec((err, post) => {
            if (err || !post) {
                return res.status(400).json({
                    error: 'No such post found'
                })
            }
            // update only if the user doesn't exists
            Post.findOne({ user_liked: { $regex: '.*' + _id + '.*' } }).exec((error, data) => {
                if (error) {
                    return res.status(400).json({
                        error: 'Something went wrong'
                    })
                } else if (data) {
                    return res.json({
                        message: 'Liked before'
                    })
                } else {
                    const liked_list = post.user_liked;
                    liked_list.push(_id);
                    return post.updateOne({
                        user_liked: liked_list,
                        likes_count: post.likes_count + 1
                    }, (er, success) => {
                        if (er) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        } else {
                            return res.json({
                                message: 'Liked'
                            })
                        }
                    })
                }
            })
        })
    }
}

// deleting a post controller
exports.removePostController = (req, res) => {
    const { _id, post_id } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        Post.deleteOne({ post_id }).exec((err, post) => {
            if (err || !post) {
                return res.status(400).json({
                    error: 'No such post found'
                })
            }

            return res.json({
                message: "Deleted successfully"
            })
        })
    }
}