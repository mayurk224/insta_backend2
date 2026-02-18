const mongoose = require("mongoose")

const verifyEmailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    }
})

const verifyEmailModel = mongoose.model("verifyEmail", verifyEmailSchema);

module.exports = verifyEmailModel;