import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncMiddleware } from "../middlewares/catchAsyncMiddleware.js";
import db from "../database/db.js";
import { v2 as cloudinary } from "cloudinary";

export const createProduct = catchAsyncMiddleware(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  let uploadImages = [];

  if (req.files && req.files.images) {
    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "products",
        width: 1000,
        crop: "scale",
      });
      uploadImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const product = await db.query(
    `INSERT INTO products (name, description, price, category, stock, images, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, description, price, category, stock, JSON.stringify(uploadImages), req.user.id],
  );
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});
