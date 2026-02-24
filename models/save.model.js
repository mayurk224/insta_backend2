const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
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

saveSchema.index({ userId: 1, postId: 1 }, { unique: true });

const saveModel = mongoose.model("saves", saveSchema);

module.exports = saveModel;
