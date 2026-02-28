const mongoose = require("mongoose");
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const uri = process.env.MONGO_URI;

function connectToDb() {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Error connecting to DB:", err);
    });
}

module.exports = connectToDb;
