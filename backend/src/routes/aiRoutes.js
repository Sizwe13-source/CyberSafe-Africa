import express from "express";
import { getAIInsights } from "../controllers/aiController.js";

const router = express.Router();

// 🔥 GET AI INSIGHTS (used by dashboard)
router.get("/insights", getAIInsights);

export default router;