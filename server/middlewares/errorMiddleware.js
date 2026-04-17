class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    err = new ErrorHandler(message, 400);
  }

  if (err.name == "JsonWebTokenError") {
    const message = "Invalid token";
    err = new ErrorHandler(message, 400);
  }

  if (err.name == "TokenExpiredError") {
    const message = "Token expired";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "CastError") {
    const message = "Invalid ID";
    err = new ErrorHandler(message, 400);
  }

  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }

  const errMessage = err.errors
    ? Object.values(err.errors)
        .map((value) => value.message)
        .join(",")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errMessage,
  });
};

export default ErrorHandler;
