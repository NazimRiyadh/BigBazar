import express from "express";
import { getAllUsers, deleteUser } from "../controllers/adminController.js";
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

export default router;
