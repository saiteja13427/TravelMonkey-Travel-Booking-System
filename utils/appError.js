//Operational error handling class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    //Test for isOperational and send only these errors to the client
    //Don't send other program errors to the clients
    this.isOperational = true;
    //To attach the stack trace to the object and not to include the constructor call here so that the stack trace remains clean
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
