const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");
const { uploadToAvatar } = require("../services/upload.service");
const bcrypt = require("bcryptjs");

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

async function changeAccountTypeController(req, res) {
  const user = await userModel.findById(req.user.userId);

  user.accountType.isPrivate = !user.accountType.isPrivate;

  user.save();

  return res.status(200).json({
    success: true,
    message: `Account Type changed to : ${user.accountType.isPrivate ? "private" : "public"}`,
  });
}

async function changePasswordController(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required",
      });
    }

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old one",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function followUserController(req, res) {
  try {
    const { username } = req.params;
    const { userId } = req.user;

    const targetUser = await userModel
      .findOne({ username })
      .select("_id accountType.isPrivate stats.followerCount")
      .lean();

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const existingFollow = await followModel.findOne({
      followerId: userId,
      followingId: targetUser._id,
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message:
          existingFollow.status === "pending"
            ? `Follow request already sent to @${username}.`
            : `You are already following @${username}.`,
      });
    }

    const status = targetUser.accountType.isPrivate
      ? "pending"
      : "accepted";

    await followModel.create({
      followerId: userId,
      followingId: targetUser._id,
      status,
    });

    if (status === "accepted") {
      await Promise.all([
        userModel.updateOne(
          { _id: userId },
          { $inc: { "stats.followingCount": 1 } }
        ),
        userModel.updateOne(
          { _id: targetUser._id },
          { $inc: { "stats.followerCount": 1 } }
        ),
      ]);
    }

    return res.status(200).json({
      success: true,
      message:
        status === "pending"
          ? `Follow request sent to @${username}.`
          : `You are now following @${username}.`,
    });

  } catch (err) {
    console.error("followUserController:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Already following or request exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getMyProfileController,
  editMyProfileController,
  changeAccountTypeController,
  changePasswordController,
  followUserController,
};
