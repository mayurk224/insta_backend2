const express = require("express");
const {
  signUpController,
  signInController,
  logout,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  resendVerifyEmailController,
  getMeController,
  verifyResetTokenController,
} = require("../controllers/auth.controller");
const { identifyUser } = require("../middlewares/auth.middleware");

const authRouter = express.Router();

authRouter.post("/sign-up", signUpController);

authRouter.post("/resend-verify-email", resendVerifyEmailController)

authRouter.post("/verify-email", verifyEmailController);

authRouter.post("/sign-in", signInController);

authRouter.post("/logout", logout);

authRouter.post("/forgot-password", forgotPasswordController);

authRouter.get("/verify-reset-token", verifyResetTokenController);

authRouter.post("/reset-password", resetPasswordController);

authRouter.get("/get-me", identifyUser, getMeController);

module.exports = authRouter;
