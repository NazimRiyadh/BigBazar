import { catchAsyncMiddleware } from "../middlewares/catchAsyncMiddleware.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import db from "../database/db.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = catchAsyncMiddleware(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const offset = (safePage - 1) * safeLimit;

  const usersResult = await db.query(
    `SELECT 
            id, 
            name, 
            email, 
            avatar, 
            role, 
            created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
    [safeLimit, offset],
  );

  const countResult = await db.query("SELECT COUNT(*) FROM users");

  const totalUsers = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalUsers / safeLimit);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users: usersResult.rows,
    pagination: {
      currentPage: safePage,
      totalPages: totalPages,
      totalUsers: totalUsers,
      limit: safeLimit,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  });
});

export const deleteUser = catchAsyncMiddleware(async (req, res, next) => {
  const { userId: id } = req.params;

  const userResult = await db.query(
    `SELECT id, avatar FROM users WHERE id = $1`,
    [id],
  );

  if (userResult.rows.length === 0) {
    return next(new ErrorHandler("User not found", 404));
  }

  const user = userResult.rows[0];

  if (user.avatar && user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  const deleteResult = await db.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id],
  );

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    deletedUser: {
      id: deleteResult.rows[0].id,
      name: deleteResult.rows[0].name,
      email: deleteResult.rows[0].email,
    },
  });
});
