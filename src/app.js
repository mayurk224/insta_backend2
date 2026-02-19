const cookieParser = require("cookie-parser");
const express = require("express");
const authRouter = require("../routes/auth.route");
const postRouter = require("../routes/post.route");
const { identifyUser } = require("../middlewares/auth.middleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/posts", postRouter);

module.exports = app;
