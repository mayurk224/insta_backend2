const express = require("express");
const { identifyUser } = require("../middlewares/auth.middleware");
const {
  getMyProfileController,
  editMyProfile,
  editMyProfileController,
  changeAccountTypeController,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");

const userRouter = express.Router();

userRouter.get("/profile", identifyUser, getMyProfileController);

userRouter.post(
  "/edit-profile",
  identifyUser,
  upload.single("avatar"),
  editMyProfileController,
);

userRouter.patch("/account-privacy", identifyUser, changeAccountTypeController);

module.exports = userRouter;
