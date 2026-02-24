const mongoose = require("mongoose");
const followModel = require("../models/follow.model");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { uploadToCloud } = require("../services/upload.service");
const deleteImageKitFiles = require("../services/deleteMedia.service");
const likeModel = require("../models/like.model");
const commentModel = require("../models/comment.model");
const saveModel = require("../models/save.model");

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
      mediaFileId: mediaDetails.fileId,
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

async function editPostController(req, res) {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const { caption } = req.body;
    const media = req.file;

    if (caption === undefined && !media) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const update = {};

    if (caption !== undefined) {
      if (typeof caption !== "string") {
        return res.status(400).json({
          success: false,
          message: "caption must be a string",
        });
      }

      update.caption = caption.trim();
    }

    if (media) {
      try {
        const mediaDetails = await uploadToCloud(media);

        if (!mediaDetails || !mediaDetails.url || !mediaDetails.fileType) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload media",
          });
        }

        update.mediaUrl = mediaDetails.url;
        update.mediaType = mediaDetails.fileType;
        update.mediaFileId = mediaDetails.fileId;
      } catch (uploadError) {
        console.error(uploadError);

        return res.status(500).json({
          success: false,
          message: "Failed to upload media",
        });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const updatedPost = await postModel
      .findOneAndUpdate(
        { _id: postId, userId },
        { $set: update },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .lean();

    if (!updatedPost) {
      const exists = await postModel.exists({ _id: postId });

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this post",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
}

async function deletePostController(req, res) {
  const { postId } = req.params;
  const { userId } = req.user || {};

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const post = await postModel.findById(postId).session(session);

      if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
      }

      if (post.userId.toString() !== userId.toString()) {
        const error = new Error("You are not allowed to delete this post");
        error.status = 403;
        throw error;
      }

      await postModel.deleteOne({ _id: postId }, { session });

      if (post.mediaFileId) {
        await deleteImageKitFiles([post.mediaFileId]);
      }

      await userModel.updateOne(
        { _id: userId },
        { $inc: { "stats.postCount": -1 } },
        { session },
      );
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);

    const statusCode = error && error.status ? error.status : 500;
    let message = "Failed to delete post";

    if (statusCode === 404) {
      message = "Post not found";
    } else if (statusCode === 403) {
      message = "You are not allowed to delete this post";
    } else if (statusCode === 401) {
      message = "Unauthorized";
    }

    return res.status(statusCode).json({
      success: false,
      message,
    });
  } finally {
    session.endSession();
  }
}

async function likePostController(req, res) {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await postModel
      .findById(postId)
      .populate("userId", "_id accountType.isPrivate")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postOwner = post.userId;

    if (postOwner && postOwner.accountType && postOwner.accountType.isPrivate) {
      const isOwner = postOwner._id.toString() === userId.toString();

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

    try {
      await likeModel.create({
        userId,
        postId,
      });

      await postModel.updateOne(
        { _id: postId },
        {
          $inc: { likesCount: 1 },
        },
      );

      return res.status(200).json({
        success: true,
        liked: true,
        message: "post liked",
      });
    } catch (error) {
      if (error.code === 11000) {
        await likeModel.deleteOne({
          userId,
          postId,
        });

        await postModel.updateOne(
          { _id: postId },
          {
            $inc: { likesCount: -1 },
          },
        );

        return res.status(200).json({
          success: true,
          liked: false,
          message: "post unliked",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to like/unlike post",
    });
  }
}

async function commentPostController(req, res) {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const { comment } = req.body;

    const post = await postModel
      .findById(postId)
      .populate("userId", "_id accountType.isPrivate")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "comment is required",
      });
    }

    const postOwner = post.userId;

    if (postOwner && postOwner.accountType && postOwner.accountType.isPrivate) {
      const isOwner = postOwner._id.toString() === userId.toString();

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

    const trimmedComment = comment.trim();

    try {
      const newComment = await commentModel.create({
        userId,
        postId,
        comment: trimmedComment,
      });

      await postModel.updateOne(
        { _id: postId },
        {
          $inc: { commentsCount: 1 },
        },
      );

      return res.status(200).json({
        success: true,
        message: "comment added",
        comment: newComment,
      });
    } catch (error) {
      if (error.code === 11000) {
        await commentModel.updateOne(
          {
            userId,
            postId,
          },
          {
            $set: { comment: trimmedComment },
          },
        );

        return res.status(200).json({
          success: true,
          message: "comment updated",
        });
      }

      throw error;
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment on this post",
    });
  }
}

async function savePostController(req, res) {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const postExist = await postModel.exists({ _id: postId });

    if (!postExist) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    try {
      await saveModel.create({
        userId,
        postId,
      });

      return res.status(200).json({
        success: true,
        saved: true,
        message: "Post saved",
      });
    } catch (error) {
      if (error.code === 11000) {
        await saveModel.deleteOne({
          userId,
          saved: false,
          postId,
        });

        return res.status(200).json({
          success: true,
          message: "Post unsaved",
        });
      }

      throw error;
    }
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
  editPostController,
  deletePostController,
  likePostController,
  commentPostController,
  savePostController,
};
