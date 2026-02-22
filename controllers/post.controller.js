const followModel = require("../models/follow.model");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { uploadToCloud } = require("../services/upload.service");

async function createPostController(req, res) {
  try {
    const { caption } = req.body;
    const media = req.file;

    if (!media) {
      return res.status(400).json({
        success: false,
        message: "media file required",
      });
    }

    const mediaDetails = await uploadToCloud(media);

    const userId = req.user.userId;

    const post = await postModel.create({
      userId,
      caption,
      mediaUrl: mediaDetails.url,
      mediaType: mediaDetails.fileType,
    });

    await userModel.updateOne(
      { _id: userId },
      { $inc: { "stats.postCount": 1 } },
    );

    return res.status(200).json({
      success: true,
      message: "Post Created successfully",
      post,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
}

async function getMyPostsController(req, res) {
  try {
    const { userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const posts = await postModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await postModel.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      posts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
}

async function getPostController(req, res) {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await postModel
      .findById(postId)
      .populate("userId", "_id, username accountType.isPrivate")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postOwner = post.userId;

    if (postOwner.accountType.isPrivate) {
      const isOwner = userId && postOwner._id.toString() === userId.toString();

      if (!isOwner) {
        const isFollower = await followModel.exists({
          followerId: userId,
          followingId: postOwner._id,
          status: "accepted",
        });

        if (!isFollower) {
          return res.status(403).json({
            success: false,
            message: "this account is private",
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createPostController,
  getMyPostsController,
  getPostController,
};
