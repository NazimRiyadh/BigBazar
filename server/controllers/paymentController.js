import { catchAsyncMiddleware } from "../middlewares/catchAsyncMiddleware.js";
import { generatePaymentIntent } from "../utils/generatePaymentIntent.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const processPayment = catchAsyncMiddleware(async (req, res, next) => {
  const { orderId, totalPrice } = req.body;

  if (!orderId || !totalPrice) {
    return next(
      new ErrorHandler("Please provide order ID and total price", 400),
    );
  }

  const result = await generatePaymentIntent(orderId, totalPrice);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 500));
  }

  res.status(200).json({
    success: true,
    clientSecret: result.clientSecret,
  });
});

export const sendStripePublishableKey = catchAsyncMiddleware(
  async (req, res, next) => {
    res.status(200).json({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  },
);
