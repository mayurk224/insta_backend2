const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      required: true,
    },
  },
  { timestamps: true },
);

followSchema.index(
  {
    followerId: 1,
    followingId: 1,
  },
  { unique: true },
);

const followModel = mongoose.model("follows", followSchema);

module.exports = followModel;
