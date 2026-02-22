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

    const status = targetUser.accountType.isPrivate ? "pending" : "accepted";

    const followRequest = await followModel.create({
      followerId: userId,
      followingId: targetUser._id,
      status,
    });

    if (status === "accepted") {
      await Promise.all([
        userModel.updateOne(
          { _id: userId },
          { $inc: { "stats.followingCount": 1 } },
        ),
        userModel.updateOne(
          { _id: targetUser._id },
          { $inc: { "stats.followerCount": 1 } },
        ),
      ]);
    }

    return res.status(200).json({
      success: true,
      message:
        status === "pending"
          ? `Follow request sent to @${username} requestId: ${followRequest._id}.`
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

async function acceptRequestController(req, res) {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const currentUserId = req.user.userId;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const followRequest = await followModel.findOne({
      _id: requestId,
      followingId: currentUserId,
      status: "pending",
    });

    if (!followRequest) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    if (action === "reject") {
      await followModel.deleteOne({ _id: requestId });

      return res.status(200).json({
        success: true,
        message: "Follow request rejected",
      });
    }

    followRequest.status = "accepted";

    await followRequest.save();

    await Promise.all([
      userModel.updateOne(
        { _id: currentUserId },
        { $inc: { "stats.followerCount": 1 } },
      ),
      userModel.updateOne(
        { _id: followRequest.followerId },
        { $inc: { "stats.followingCount": 1 } },
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Follow request accepted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
}

async function unfollowUserController(req, res) {
  try {
    const { username } = req.params;

    const { userId } = req.user;

    const targetUser = await userModel
      .findOne({ username })
      .select("_id")
      .lean();

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (targetUser._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const unfollow = await followModel.findOneAndDelete({
      followerId: userId,
      followingId: targetUser._id,
      status: "accepted",
    });

    if (!unfollow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user",
      });
    }

    await Promise.all([
      userModel.updateOne(
        { _id: userId },
        { $inc: { "stats.followingCount": -1 } },
      ),
      userModel.updateOne(
        { _id: targetUser._id },
        { $inc: { "stats.followerCount": -1 } },
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: `You have unfollowed @${username}`,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server errro",
    });
  }
}

async function myFollowerController(req, res) {
  try {
    const { userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const followers = await followModel
      .find({
        followingId: userId,
        status: "accepted",
      })
      .populate("followerId", "username profile.avatarUrl stats.followerCount")
      .skip(skip)
      .limit(limit)
      .lean();

    const followerList = followers.map((f) => f.followerId);

    return res.status(200).json({
      success: true,
      page,
      count: followerList.length,
      followers: followerList,
    });
  } catch (error) {
    console.error("getMyFollowersController:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch followers",
    });
  }
}

module.exports = {
  getMyProfileController,
  editMyProfileController,
  changeAccountTypeController,
  changePasswordController,
  followUserController,
  acceptRequestController,
  unfollowUserController,
  myFollowerController,
};
