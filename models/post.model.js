const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    media_url: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        required: true,
    },
    hashtags: {
        type: String,
        trim: true,
    },
    likes_count: {
        default: 0,
        type: Number
    },
    user_liked: [String],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
            text: {
                type: String,
                required: true,
            },
            name: {
                type: String,
            },
            avatar: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
    post_type: {
        type: String,
        default: 0
    },
    location: {
        type: String,
        trim: true
    },
    caption: {
        type: String,
        trim: true
    },
    tagged: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    updated_date: {
        type: Date,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    no_of_views: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
    }
})

module.exports = mongoose.model('Post', postSchema)