const express = require("express");
const {
  createPostController,
  getMyPostsController,
  getPostController,
  editPostController,
  deletePostController,
} = require("../controllers/post.controller");
const { identifyUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const postRouter = express.Router();

postRouter.post(
  "/create-post",
  identifyUser,
  upload.single("media"),
  createPostController,
);

postRouter.get("/my-posts", identifyUser, getMyPostsController);

postRouter.get("/:postId", identifyUser, getPostController);

postRouter.patch(
  "/:postId",
  identifyUser,
  upload.single("media"),
  editPostController,
);

postRouter.delete("/:postId", identifyUser, deletePostController);

module.exports = postRouter;
