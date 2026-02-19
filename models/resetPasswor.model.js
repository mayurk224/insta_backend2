const { default: mongoose } = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});

const resetPasswordModel = mongoose.model("resetPassword", resetPasswordSchema);

module.exports = resetPasswordModel;
