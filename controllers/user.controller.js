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

    const update = {};

    // ✅ Username uniqueness check (exclude self)
    if (username && username !== req.user.username) {
      const exists = await userModel.exists({
        username,
        _id: { $ne: req.user.userId },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      update.username = username.trim();
    }

    // ✅ Profile fields
    if (fullname !== undefined) update["profile.fullname"] = fullname.trim();

    if (bio !== undefined) update["profile.bio"] = bio;

    // ✅ Avatar upload with safety
    if (avatar) {
      try {
        const { url } = await uploadToAvatar(avatar);
        update["profile.avatarUrl"] = url;
      } catch (uploadErr) {
        console.error("Avatar upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Avatar upload failed",
        });
      }
    }

    // ✅ Nothing to update
    if (Object.keys(update).length === 0) {
      return res.status(200).json({
        success: true,
        message: "Nothing to update",
      });
    }

    // ✅ Atomic update with $set
    const user = await userModel
      .findByIdAndUpdate(
        req.user.userId,
        { $set: update },
        {
          returnDocument: "after", // ✅ safer than returnDocument
          runValidators: true,
          select: "-password",
        },
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

module.exports = { getMyProfileController, editMyProfileController };
