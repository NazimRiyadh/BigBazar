import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routers/authRoutes.js";
import productRoutes from "./routers/productRoutes.js";
import adminRoutes from "./routers/adminRoutes.js";
import orderRoutes from "./routers/orderRoutes.js";
import paymentRoutes from "./routers/paymentRoutes.js";
import { globalLimiter } from "./utils/rateLimiter.js";
import Stripe from "stripe";
import db from "./database/db.js";

const app = express();

const { createTable } = await import("./utils/createTable.js");

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    // 1. Verify Stripe signature
    try {
      event = Stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // 2. Handle only successful payments
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const client = await db.connect();

      try {
        await client.query("BEGIN");

        // 3. Find payment record
        const paymentResult = await client.query(
          `SELECT * FROM payments WHERE payment_intent_id = $1`,
          [paymentIntentId],
        );

        if (paymentResult.rows.length === 0) {
          throw new Error("Payment record not found");
        }

        const payment = paymentResult.rows[0];

        // 4. Idempotency check
        if (payment.payment_status === "Paid") {
          await client.query("COMMIT");
          return res.status(200).send({ received: true });
        }

        const orderId = payment.order_id;

        // 5. Update payment status
        await client.query(
          `UPDATE payments 
           SET payment_status = $1 
           WHERE payment_intent_id = $2`,
          ["Paid", paymentIntentId],
        );

        // 6. Mark order as paid
        await client.query(
          `UPDATE orders 
           SET paid_at = NOW() 
           WHERE id = $1`,
          [orderId],
        );

        // 7. Get ordered items
        const { rows: orderedItems } = await client.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
          [orderId],
        );

        // 8. Reduce stock safely
        for (const item of orderedItems) {
          await client.query(
            `UPDATE products 
             SET stock = GREATEST(stock - $1, 0) 
             WHERE id = $2`,
            [item.quantity, item.product_id],
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Webhook error:", error.message);
        return res.status(500).send("Webhook processing failed");
      } finally {
        client.release();
      }
    }

    res.status(200).send({ received: true });
  },
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
);

app.use("/api", globalLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

createTable();

app.use(errorMiddleware);

export default app;
