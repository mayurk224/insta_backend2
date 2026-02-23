const cookieParser = require("cookie-parser");
const express = require("express");
const authRouter = require("../routes/auth.route");
const postRouter = require("../routes/post.route");
const userRouter = require("../routes/user.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use("/", (req, res) => {
  res.send("Welcome to Insta Backend!");
});

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api/posts", postRouter);

module.exports = app;
