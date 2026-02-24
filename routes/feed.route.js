const express = require("express");
const { identifyUser } = require("../middlewares/auth.middleware");
const getFeedController = require("../controllers/feed.controller");

const feedRouter = express.Router();

feedRouter.get("/", identifyUser, getFeedController);

module.exports = feedRouter;
