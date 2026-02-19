const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username required"],
      unique: [true, "username must be unique"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: [true, "password required"],
    },
    profile: {
      fullname: {
        type: String,
        maxlength: [50, "max length should be 50"],
      },
      bio: {
        type: String,
        maxlength: [150, "max legth should be 150"],
      },
      avatarUrl: {
        type: String,
        default: "https://ik.imagekit.io/m0no8ccps/pngwing.com.png",
      },
    },
    stats: {
      followerCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      followingCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      postCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    accountType: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      isDisabled: {
        type: Boolean,
        default: false,
      },
    },
    userVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
