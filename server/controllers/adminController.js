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

export const dashboardStats = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  );

  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1,
  );

  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const totalRevenueAllTimeQuery = await db.query(`
    SELECT SUM(total_price) FROM orders WHERE paid_at IS NOT NULL    
    `);
  const totalRevenueAllTime =
    parseFloat(totalRevenueAllTimeQuery.rows[0].sum) || 0;

  // Total Users
  const totalUsersCountQuery = await db.query(`
    SELECT COUNT(*) FROM users WHERE role = 'User'`);

  const totalUsersCount = parseInt(totalUsersCountQuery.rows[0].count) || 0;

  // Order Status Counts
  const orderStatusCountsQuery = await db.query(`
      SELECT order_status, COUNT(*) FROM orders WHERE paid_at IS NOT NULL GROUP BY order_status
      `);

  const orderStatusCounts = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  orderStatusCountsQuery.rows.forEach((row) => {
    orderStatusCounts[row.order_status] = parseInt(row.count);
  });

  // Today's Revenue
  const todayRevenueQuery = await db.query(
    `
    SELECT SUM(total_price) FROM orders WHERE created_at::date = $1 AND paid_at IS NOT NULL
    `,
    [todayDate],
  );
  const todayRevenue = parseFloat(todayRevenueQuery.rows[0].sum) || 0;

  // Yesterday's Revenue
  const yesterdayRevenueQuery = await db.query(
    `
    SELECT SUM(total_price) FROM orders WHERE created_at::date = $1 AND paid_at IS NOT NULL  
    `,
    [yesterdayDate],
  );
  const yesterdayRevenue = parseFloat(yesterdayRevenueQuery.rows[0].sum) || 0;

  //Monthly Sales For Line Chart
  const monthlySalesQuery = await db.query(`
    SELECT
    TO_CHAR(created_at, 'Mon YYYY') AS month,
    DATE_TRUNC('month', created_at) as date,
    SUM(total_price) as totalsales
    FROM orders WHERE paid_at IS NOT NULL
    GROUP BY month, date
    ORDER BY date ASC
    `);

  const monthlySales = monthlySalesQuery.rows.map((row) => ({
    month: row.month,
    totalsales: parseFloat(row.totalsales) || 0,
  }));

  // Top 5 Most Sold Products
  const topSellingProductsQuery = await db.query(`
    SELECT p.name,
    p.images->0->>'url' AS image,
    p.category,
    p.ratings,
    SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.paid_at IS NOT NULL
    GROUP BY p.name, p.images, p.category, p.ratings
    ORDER BY total_sold DESC
    LIMIT 5
  `);

  const topSellingProducts = topSellingProductsQuery.rows;

  // Total Sales of Current Month
  const currentMonthSalesQuery = await db.query(
    `
      SELECT SUM(total_price) AS total 
      FROM orders 
      WHERE paid_at IS NOT NULL AND created_at BETWEEN $1 AND $2  
      `,
    [currentMonthStart, currentMonthEnd],
  );

  const currentMonthSales =
    parseFloat(currentMonthSalesQuery.rows[0].total) || 0;

  // Products with stock less than or equal to 5
  const lowStockProductsQuery = await db.query(`
        SELECT name, stock FROM products WHERE stock <= 5 
      `);

  const lowStockProducts = lowStockProductsQuery.rows;

  // Revenue Growth Rate (%)
  const lastMonthRevenueQuery = await db.query(
    `
      SELECT SUM(total_price) AS total 
      FROM orders
      WHERE paid_at IS NOT NULL AND created_at BETWEEN $1 AND $2
    `,
    [previousMonthStart, previousMonthEnd],
  );

  const lastMonthRevenue = parseFloat(lastMonthRevenueQuery.rows[0].total) || 0;

  let revenueGrowth = "0%";

  if (lastMonthRevenue > 0) {
    const growthRate =
      ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100;
    revenueGrowth = `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(2)}%`;
  }

  // New Users This Month
  const newUsersThisMonthQuery = await db.query(
    `
    SELECT COUNT(*) FROM users WHERE created_at >= $1 AND role = 'User'
  `,
    [currentMonthStart],
  );

  const newUsersThisMonth = parseInt(newUsersThisMonthQuery.rows[0].count) || 0;

  // FINAL RESPONSE
  res.status(200).json({
    success: true,
    message: "Dashboard Stats Fetched Successfully",
    totalRevenueAllTime,
    todayRevenue,
    yesterdayRevenue,
    totalUsersCount,
    orderStatusCounts,
    monthlySales,
    currentMonthSales,
    topSellingProducts,
    lowStockProducts,
    revenueGrowth,
    newUsersThisMonth,
  });
});
