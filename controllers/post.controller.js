const postModel = require("../models/post.model");
const uploadToCloud = require("../services/upload.service");

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

module.exports = {
  createPostController,
};
