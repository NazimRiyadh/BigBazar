import express from "express";
import { chat, batchIndex } from "../controllers/chatbotController.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/batch-index", isAuthenticated, authorizedRoles("admin"), batchIndex);

export default router;
