const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./db/config");

dotenv.config();
connectDB();

const app = require("./app");

//Global handler for Uncaught Exceptions
process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXCEPTION!! 🔥 Shutting Down");
  console.log("ERROR: ", error.name, error.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("Hey I am Here on 5000");
});

//Global handler for Unhandled Promise Rejections
process.on("unhandledRejection", (error) => {
  console.log("UNHANDLED REJECTION!! 🔥 Shutting Down");
  console.log("ERROR: ", error.name, error.message);
  //First closing the server so that it gets time to finish pending tasks
  //And then we shut it down using process.exit;
  //Only process.exit can be really abrupt and is a bad way to exit
  server.close(() => {
    process.exit(1);
  });
});
