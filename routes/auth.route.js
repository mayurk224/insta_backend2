const express = require("express");
const { signUpController } = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/sign-up", signUpController)

module.exports = authRouter;