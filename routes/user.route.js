const express = require("express");
const { identifyUser } = require("../middlewares/auth.middleware");
const {
  getMyProfileController,
  editMyProfile,
  editMyProfileController,
  changeAccountTypeController,
  changePasswordController,
  followUserController,
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

userRouter.patch("/change-password", identifyUser, changePasswordController);

userRouter.patch("/:username/follow", identifyUser, followUserController);

module.exports = userRouter;
