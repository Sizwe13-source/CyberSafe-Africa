import express from "express";
import { analyzeActivity } from "../controllers/activityController.js";

const router = express.Router();

// 🔥 POST /api/activity
router.post("/", analyzeActivity);

export default router;