const express = require("express");
const morgan = require("morgan");
const ratelimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const xss = require("xss-clean");
const helmet = require("helmet");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require("./utils/appError");
const errorController = require("./controllers/errorController");

const app = express();

//GLOBAL MIDDLEWARES
//Set Security HTTP Headers
app.use(helmet());

//Logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//Rate Limiting
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try after some time",
});
app.use("/api", limiter);

//Body Parser: You can pass {limit: "10kb"} to allow on 10kb data to the api
app.use(express.json());

//Data sanitisation against NOSQL Query Injection
app.use(mongoSanitize());
//Data sanitisation against XSS
app.use(xss());

//Parameter Pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "name",
      "maxGroupSize",
      "difficulty",
      "price",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

//Static files
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

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
