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

module.exports = {
  createPostController,
  getMyPostsController
};
