const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("./models/tourModel");
const connectDB = require("./db/config");
const tours = require("./dev-data/data/tours");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Tours Created");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data Destroyed");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
} else {
  console.log("Please give correct inputs -i/-d to import/destroy data");
}
