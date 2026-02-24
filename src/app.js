const cookieParser = require("cookie-parser");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authRouter = require("../routes/auth.route");
const postRouter = require("../routes/post.route");
const userRouter = require("../routes/user.route");
const feedRouter = require("../routes/feed.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("Welcome to Insta Backend!");
});

app.use("/api/auth", authLimiter, authRouter);

app.use("/api/users", userRouter);

app.use("/api/posts", postRouter);

app.use("/api/feed", feedRouter);

module.exports = app;
