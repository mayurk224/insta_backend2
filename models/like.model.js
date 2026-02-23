const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  },
  { timestamps: true },
);

likeSchema.index(
  {
    userId: 1,
    postId: 1,
  },
  { unique: true },
);

const likeModel = mongoose.model("likes", likeSchema);

module.exports = likeModel;
