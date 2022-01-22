const AppError = require("../utils/appError");

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (error) => {
  const key = Object.keys(error.keyValue)[0];
  const dupValue = error.keyValue[key];
  const message = `Duplicate field value for ${key}: ${dupValue}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errorList = Object.values(error.errors).map((e) => e.message);
  const message = `Invalid Input: ${errorList.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
  new AppError("Invalid Token. Please login again", 401);

const handleTokenExpiredError = () =>
  new AppError("Token Expired. Please login again", 401);

//Send development error
const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

//Send production error
const sendErrorProd = (error, res) => {
  //Operational error which we can send to client
  if (error.isOperational) {
    res
      .status(error.statusCode)
      .json({ status: error.status, message: error.message });
    //Non operational, programmatic or unknonw error which we don't want client to know
  } else {
    console.error("ERROR: ", error);
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
};

//Main error controller
const errorController = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...error };
    if (error.name === "CastError") {
      err = handleCastErrorDB(err);
    }
    if (error.code === 11000) {
      err = handleDuplicateErrorDB(err);
    }
    if (error.name === "ValidationError") {
      err = handleValidationErrorDB(err);
    }
    if (error.name === "JsonWebTokenError") {
      err = handleJsonWebTokenError();
    }
    if (error.name === "TokenExpiredError") {
      err = handleTokenExpiredError();
    }
    sendErrorProd(err, res);
  }
};

module.exports = errorController;
