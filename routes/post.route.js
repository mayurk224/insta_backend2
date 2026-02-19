const express = require("express");
const { createPostController } = require("../controllers/post.controller");
const { identifyUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const postRouter = express.Router();

postRouter.post(
  "/create-post",
  identifyUser,
  upload.single("media"),
  createPostController,
);

module.exports = postRouter;
