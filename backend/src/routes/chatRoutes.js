import express from "express";
import rateLimit from "express-rate-limit";
import { chat } from "../controllers/chatController.js";

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Chat rate limit reached, please wait." },
});

router.post("/", chatLimiter, chat);

export default router;
