const express = require("express");
const { signUpController, signInController, logout, forgotPasswordController } = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/sign-up", signUpController)

authRouter.post("/sign-in", signInController)

authRouter.post("/logout", logout)

authRouter.post("/forgot-password", forgotPasswordController)

module.exports = authRouter;