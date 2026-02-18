const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username required"],
        unique: [true, "username must be unique"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email must be unique"]
    },
    password: {
        type: String,
        required: [true, "password required"],
    },
    profile: {
        fullname: {
            type: String,
        },
        bio: {
            type: String,
        },
        avatarUrl: {
            type: String
        }
    },
    stats: {
        followerCount: {
            type: Number,
            default: 0,
            min: 0
        },
        followingCount: {
            type: Number,
            default: 0,
            min: 0
        },
        postCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    accountType: {
        isPrivate: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isDisabled: {
            type: Boolean,
            default: false
        }
    },
    userVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;