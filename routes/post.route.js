const express = require("express");
const { createPostController, getMyPostsController } = require("../controllers/post.controller");
const { identifyUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const postRouter = express.Router();

postRouter.post(
  "/create-post",
  identifyUser,
  upload.single("media"),
  createPostController,
);

postRouter.get("/my-posts", identifyUser, getMyPostsController)

module.exports = postRouter;
