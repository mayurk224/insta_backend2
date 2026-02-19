const userModel = require("../models/user.model");
const { uploadToAvatar } = require("../services/upload.service");

async function getMyProfileController(req, res) {
  const user = await userModel.findById(req.user.userId).select("-password");

  return res.status(200).json({
    success: true,
    user,
  });
}

async function editMyProfileController(req, res) {
  try {
    const { username, fullname, bio } = req.body;
    const avatar = req.file;

    const user = await userModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (username && username !== user.username) {
      const existingUserName = await userModel.findOne({ username });

      if (existingUserName) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      user.username = username;
    }

    if (fullname) {
      user.profile.fullname = fullname;
    }

    if (bio !== undefined) {
      user.profile.bio = bio;
    }

    if (avatar) {
      const avatarDetails = await uploadToAvatar(avatar);

      user.profile.avatarUrl = avatarDetails.url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile update successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

module.exports = { getMyProfileController, editMyProfileController };
