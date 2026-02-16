require("dotenv").config();
const connectToDb = require("./config/database");
const app = require("./src/app");

const PORT = process.env.PORT;

connectToDb();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})