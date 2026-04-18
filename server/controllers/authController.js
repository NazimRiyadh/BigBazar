import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncMiddleware } from "../middlewares/catchAsyncMiddleware.js";
import { sendToken } from "../utils/jwtToken.js";
import db from "../database/db.js";
import bcrypt from "bcrypt";
import { generateResetPasswordToken } from "../utils/generateResetPasswordToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateEmailPasswordForgotTemplate } from "../utils/generateEmailPasswordForgotTemplate.js";
import crypto from "crypto";

export const registerUser = catchAsyncMiddleware(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  const isAlreadyExists = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );
  if (isAlreadyExists.rows.length > 0) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password.toString(), 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
    [name, email, hashedPassword],
  );

  sendToken(result.rows[0], 201, res);
});

export const loginUser = catchAsyncMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  const user = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  const isPasswordValid = await bcrypt.compare(
    password.toString(),
    user.rows[0].password,
  );
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  sendToken(user.rows[0], 200, res);
});

export const logoutUser = catchAsyncMiddleware(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getUser = catchAsyncMiddleware(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export const forgotPassword = catchAsyncMiddleware(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please provide the email"));
  }
  const frontendUrl = process.env.FRONTEND_URL;

  let userResult = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  if (userResult.rows.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  const user = userResult.rows[0];

  const { resetToken, hashedToken, resetTokenExpiry } =
    generateResetPasswordToken();

  await db.query(
    `UPDATE users SET reset_password_token = $1, reset_password_expires = to_timestamp($2) WHERE id = $3`,
    [hashedToken, resetTokenExpiry / 1000, user.id],
  );

  const resetTokenUrl = `${frontendUrl}/password/reset/${resetToken}`;

  const html = generateEmailPasswordForgotTemplate(resetTokenUrl, user.name);

  try {
    await sendEmail({
      email,
      subject: "Reset Password",
      html,
    });
  } catch (error) {
    await db.query(
      `UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1`,
      [user.id],
    );
    return next(new ErrorHandler("Failed to send reset password link", 500));
  }

  res.status(200).json({
    success: true,
    message: "Reset password link sent successfully",
  });
});

export const resetPassword = catchAsyncMiddleware(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await db.query(
    `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
    [resetPasswordToken],
  );
  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid token", 400));
  }

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const hashedPassword = await bcrypt.hash(password.toString(), 10);
  await db.query(
    `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2`,
    [hashedPassword, user.rows[0].id],
  );
  sendToken(user.rows[0], 200, res);
});

export const updatePassword = catchAsyncMiddleware(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const user = await db.query(`SELECT * FROM users WHERE id = $1`, [
    req.user.id,
  ]);
  const isPasswordValid = await bcrypt.compare(
    oldPassword.toString(),
    user.rows[0].password,
  );
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);
  await db.query(`UPDATE users SET password = $1 WHERE id = $2`, [
    hashedPassword,
    user.rows[0].id,
  ]);
  sendToken(user.rows[0], 200, res);
});
