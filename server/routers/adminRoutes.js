import express from "express";
import { getAllUsers } from "../controllers/adminController.js";
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

export default router;
