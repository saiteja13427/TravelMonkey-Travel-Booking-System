const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const errorController = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

//Not Handled Routes Throwing 404
//app.all handles all the HTTP Methods
app.all("*", (req, res, next) => {
  // res
  //   .status(404)
  //   .json({ status: "Fail", message: `Cannot Find ${req.originalUrl}` });
  // error.status = "fail";
  // error.statusCode = 404;
  next(new AppError(`Cannot Find ${req.originalUrl} on the server`, 404));
});

app.use(errorController);

module.exports = app;
