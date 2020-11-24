const mongoose = require('mongoose')
const crypto = require('crypto')
const { timeStamp } = require('console')

const Schema = mongoose.Schema;
// creating user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    role: {
        type: String,
        default: 'Normal'
    },
    resetPasswordLink: {
        data: String,
        default: ''
    },
    bio: {
        data: String,
        default: ''
    },
    profile_pic: {
        data: String,
        default: ''
    },
    gender: {
        data: String,
        default: ''
    },
    private_account: {
        data: String,
        default: ''
    },
    location: {
        data: String,
        default: ''
    },
    active: {
        data: String,
        default: ''
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    updated_date: {
        type: Date,
        default: ''
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "posts",
    },
    post_id: {
        type: String,
        default: ''
    },
    follow: {
        follower: {
            type: String,
            default: ''
        },
        following: {
            type: String,
            default: ''
        }
    }
}, { timeStamp: true })


// virtual password
userSchema.virtual('password').set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
}).get(function () {
    return this._password
})


// methods
userSchema.methods = {
    // generate salt
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + ''
    },
    // encrypt password
    encryptPassword: function (password) {
        if (!password) return ''
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (error) {
            return ''
        }
    },
    // compare passwords received from the user and hashed
    authenticate: function (plainPassword) {
        return this.encryptPassword(plainPassword) === this.hashed_password
    }
}


module.exports = mongoose.model('User', userSchema)