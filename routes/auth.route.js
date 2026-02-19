const express = require("express");
const {
  signUpController,
  signInController,
  logout,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/sign-up", signUpController);

authRouter.post("/verify-email", verifyEmailController);

authRouter.post("/sign-in", signInController);

authRouter.post("/logout", logout);

authRouter.post("/forgot-password", forgotPasswordController);

authRouter.post("/reset-password", resetPasswordController);

module.exports = authRouter;
