const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./db/config");

dotenv.config();
connectDB();

const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Hey I am Here on 5000");
});
