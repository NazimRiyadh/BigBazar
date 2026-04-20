import express from "express";
import {
  getAllUsers,
  deleteUser,
  dashboardStats,
} from "../controllers/adminController.js";
import {
  isAuthenticated,
  authorizedRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/get-all-users",
  isAuthenticated,
  authorizedRoles("admin"),
  getAllUsers,
);

router.delete(
  "/delete-user/:userId",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteUser,
);

router.get(
  "/dashboard-stats",
  isAuthenticated,
  authorizedRoles("admin"),
  dashboardStats,
);

export default router;
