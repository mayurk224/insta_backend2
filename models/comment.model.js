const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

commentSchema.index(
  {
    userId: 1,
    postId: 1,
  },
  { unique: true },
);

const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel;
