import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncMiddleware } from "./catchAsyncMiddleware.js";
import jwt from "jsonwebtoken";
import db from "../database/db.js";

export const isAuthenticated = catchAsyncMiddleware(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await db.query(`SELECT * FROM users WHERE id = $1`, [
    decoded.id,
  ]);
  if (user.rows.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  req.user = user.rows[0];
  next();
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not authorized to access this resource`,
          403,
        ),
      );
    }
    next();
  };
};
