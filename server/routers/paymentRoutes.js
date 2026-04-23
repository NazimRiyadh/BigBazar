import express from "express";
import { processPayment, sendStripePublishableKey } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/process", isAuthenticated, processPayment);
router.get("/stripe-key", isAuthenticated, sendStripePublishableKey);

export default router;
