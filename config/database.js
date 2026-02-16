const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

function connectToDb() {
    mongoose.connect(uri).then(() => {
        console.log("Connected to DB");
    }).catch((err) => {
        console.log("Error connecting to DB:", err);
    })
}

module.exports = connectToDb;