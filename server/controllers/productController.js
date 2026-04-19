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
    [
      name,
      description,
      price,
      category,
      stock,
      JSON.stringify(uploadImages),
      req.user.id,
    ],
  );
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

export const fetchAllProducts = catchAsyncMiddleware(async (req, res, next) => {
  const { availability, price, category, ratings, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const conditions = [];
  let values = [];
  let index = 1;

  let paginationPlaceholders = {};

  // Filter products by availability
  if (availability === "in-stock") {
    conditions.push(`stock > 5`);
  } else if (availability === "limited") {
    conditions.push(`stock > 0 AND stock <= 5`);
  } else if (availability === "out-of-stock") {
    conditions.push(`stock = 0`);
  }

  // Filter products by price
  if (price) {
    const [minPrice, maxPrice] = price.split("-");
    if (minPrice && maxPrice) {
      conditions.push(`price BETWEEN $${index} AND $${index + 1}`);
      values.push(minPrice, maxPrice);
      index += 2;
    }
  }

  // Filter products by category
  if (category) {
    conditions.push(`category ILIKE $${index}`);
    values.push(`%${category}%`);
    index++;
  }

  // Filter products by rating
  if (ratings) {
    conditions.push(`ratings >= $${index}`);
    values.push(ratings);
    index++;
  }

  // Add search query
  if (search) {
    conditions.push(
      `(p.name ILIKE $${index} OR p.description ILIKE $${index})`,
    );
    values.push(`%${search}%`);
    index++;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Get count of filtered products
  const totalProductsResult = await db.query(
    `SELECT COUNT(*) FROM products p ${whereClause}`,
    values,
  );

  const totalProducts = parseInt(totalProductsResult.rows[0].count);

  paginationPlaceholders.limit = `$${index}`;
  values.push(limit);
  index++;

  paginationPlaceholders.offset = `$${index}`;
  values.push(offset);
  index++;

  // FETCH WITH REVIEWS
  const query = `
    SELECT p.*, 
    COUNT(r.id) AS review_count 
    FROM products p 
    LEFT JOIN reviews r ON p.id = r.product_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ${paginationPlaceholders.limit}
    OFFSET ${paginationPlaceholders.offset}
    `;

  const result = await db.query(query, values);

  // QUERY FOR FETCHING NEW PRODUCTS
  const newProductsQuery = `
    SELECT p.*,
    COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;
  const newProductsResult = await db.query(newProductsQuery);

  // QUERY FOR FETCHING TOP RATING PRODUCTS (rating >= 4.5)
  const topRatedQuery = `
    SELECT p.*,
    COUNT(r.id) AS review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.ratings >= 4.5
    GROUP BY p.id
    ORDER BY p.ratings DESC, p.created_at DESC
    LIMIT 8
  `;
  const topRatedResult = await db.query(topRatedQuery);

  res.status(200).json({
    success: true,
    products: result.rows,
    totalProducts,
    newProducts: newProductsResult.rows,
    topRatedProducts: topRatedResult.rows,
  });
});
