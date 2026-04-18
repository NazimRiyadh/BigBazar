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

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getUser);
router.post("/forgot", forgotPassword);
router.put("/reset/:token", resetPassword);
router.put("/update/password", isAuthenticated, updatePassword);
router.put("/update/profile", isAuthenticated, updateProfile);

export default router;
