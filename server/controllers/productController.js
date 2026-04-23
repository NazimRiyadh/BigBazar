import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import db from "../database/db.js";
import { v2 as cloudinary } from "cloudinary";

export const createProduct = catchAsyncErrors(async (req, res, next) => {
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

export const fetchAllProducts = catchAsyncErrors(async (req, res, next) => {
  const { availability, price, category, ratings, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const offset = (safePage - 1) * safeLimit;

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
  values.push(safeLimit);
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

export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || !price || !category || !stock) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }

  const product = await db.query(`SELECT * FROM products WHERE id=$1`, [
    productId,
  ]);
  if (!product.rows.length) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const updatedProduct = await db.query(
    `UPDATE products SET name=$1,description=$2,price=$3,category=$4,stock=$5 WHERE id=$6 RETURNING *`,
    [name, description, price, category, stock, productId],
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct.rows[0],
  });
});

export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const product = await db.query(`SELECT * FROM products WHERE id=$1`, [
    productId,
  ]);
  if (!product.rows.length) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const images = product.rows[0].images;
  if (images.length > 0) {
    for (const image of images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }
  const deleteProduct = await db.query(
    `DELETE FROM products WHERE id=$1 RETURNING *`,
    [productId],
  );
  if (!deleteProduct.rows.length) {
    return next(new ErrorHandler("Product not deleted", 404));
  }
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    product: deleteProduct.rows[0],
  });
});

export const fetchSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const result = await db.query(
    `
      SELECT p.*,COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('review_id', r.id,'rating', 
        r.rating,'comment', r.comment,'created_at', r.created_at,'reviewer', 
        jsonb_build_object('id', u.id,'name', u.name,'avatar', u.avatar))
          ORDER BY r.created_at DESC)
           FROM reviews r
           LEFT JOIN users u ON r.user_id = u.id
           WHERE r.product_id = p.id
          ),
          '[]'::jsonb                               
        ) AS reviews
      FROM products p
      WHERE p.id = $1;
      `,
    [productId],
  );

  const product = result.rows[0];

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id: ${productId}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    message: "Product fetched successfully.",
    product: product,
  });
});

export const postProductReview = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return next(new ErrorHandler("Please enter all the fields", 400));
  }
  const purchasedQuery = `
    SELECT oi.product_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN payments p ON p.order_id = o.id
    WHERE o.buyer_id = $1
    AND oi.product_id = $2
    AND p.payment_status = 'Paid'
    LIMIT 1 
    `;
  const purchased = await db.query(purchasedQuery, [req.user.id, productId]);
  if (!purchased.rows.length) {
    return next(new ErrorHandler("You have not purchased this product", 403));
  }
  const existingReviewQuery = `
    SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2
    `;
  const existingReview = await db.query(existingReviewQuery, [
    req.user.id,
    productId,
  ]);
  if (existingReview.rows.length) {
    review = await db.query(
      `UPDATE reviews SET rating=$1,comment=$2 WHERE user_id=$3 AND product_id=$4 RETURNING *`,
      [rating, comment, req.user.id, productId],
    );
  } else {
    const review = await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, productId, rating, comment],
    );
  }

  const averageRatingQuery = `
    SELECT AVG(rating) FROM reviews WHERE product_id = $1
    `;
  const averageRating = await db.query(averageRatingQuery, [productId]);
  const updatedProduct = await db.query(
    `UPDATE products SET ratings=$1 WHERE id=$2 RETURNING *`,
    [averageRating.rows[0].avg, productId],
  );

  res.status(201).json({
    success: true,
    message: "Review posted successfully",
    review: review.rows[0],
  });
});

export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.params;

  const review = await db.query(
    "Delete from reviews where user_id=$1 and product_id=$2 RETURNING *",
    [req.user.id, productId],
  );

  if (!review.rows.length) {
    return next(new ErrorHandler("Review not found", 404));
  }

  const averageRatingQuery = `
    SELECT AVG(rating) FROM reviews WHERE product_id = $1
    `;
  const averageRating = await db.query(averageRatingQuery, [productId]);
  const updatedProduct = await db.query(
    `UPDATE products SET ratings=$1 WHERE id=$2 RETURNING *`,
    [averageRating.rows[0].avg, productId],
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    review: updateProduct.rows[0],
  });
});
