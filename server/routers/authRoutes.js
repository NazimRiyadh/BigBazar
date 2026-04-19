import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUser);
router.post("/forgot", authLimiter, forgotPassword);
router.put("/reset/:token", authLimiter, resetPassword);
router.put("/update/password", isAuthenticated, updatePassword);
router.put("/update/profile", isAuthenticated, updateProfile);

export default router;
