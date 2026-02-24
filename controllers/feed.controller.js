const followModel = require("../models/follow.model");
const postModel = require("../models/post.model");

async function getFeedController(req, res) {
  try {
    const { userId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = await followModel
      .find({
        followerId: userId,
        status: "accepted",
      })
      .select("followingId")
      .lean();

    const followingsId = following.map((f) => f.followingId);

    followingsId.push(userId);

    const posts = await postModel
      .find({
        userId: { $in: followingsId },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username profile.avatarUrl")
      .lean();

    return res.status(200).json({
      success: true,
      page,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getFeedController;
