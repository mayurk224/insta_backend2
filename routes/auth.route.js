const express = require("express");
const { signUpController, signInController, logout } = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/sign-up", signUpController)

authRouter.post("/sign-in", signInController)

authRouter.post("/logout",logout)

module.exports = authRouter;