import db from "../database/db.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const generatePaymentIntent = async (orderId, totalPrice) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Ensure order exists + optional validation
    const orderResult = await client.query(
      `SELECT id, total_price FROM orders WHERE id = $1`,
      [orderId],
    );

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }

    // 2. Prevent duplicate payment intent
    const existingPayment = await client.query(
      `SELECT * FROM payments WHERE order_id = $1`,
      [orderId],
    );

    if (existingPayment.rows.length > 0) {
      await client.query("COMMIT");
      return {
        success: true,
        clientSecret: existingPayment.rows[0].payment_intent_client_secret,
      };
    }

    // 3. Safe amount conversion
    const amountInCents = Math.round(totalPrice * 100);

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        orderId: String(orderId),
      },
    });

    // 5. Save in DB
    await client.query(
      `INSERT INTO payments 
        (order_id, payment_type, payment_status, payment_intent_id, payment_intent_client_secret)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, "Online", "Pending", paymentIntent.id, paymentIntent.client_secret],
    );

    await client.query("COMMIT");

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Payment Intent Error:", error.message);

    return {
      success: false,
      message: "Failed to generate payment intent",
    };
  } finally {
    client.release();
  }
};
