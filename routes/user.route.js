const express = require("express");
const { identifyUser } = require("../middlewares/auth.middleware");
const { getMyProfileController } = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.get("/", identifyUser, getMyProfileController);

module.exports = userRouter;
