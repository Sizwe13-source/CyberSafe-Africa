//src/routes/incidentRoutes.js
import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

import {
  createIncident,
  getAllIncidents,
  getDashboardStats,
  updateIncidentStatus,
  getFilteredIncidents,
  getThreatStats,
  getCommunityAlerts,
} from "../controllers/incidentController.js";

import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

// 📦 Multer setup
const upload = multer({
  storage,
  fileFilter,
});

// ===============================
// 🚀 ROUTES (TESTING MODE)
// ===============================

// ✅ Create incident (user)
router.post("/", protectUser, createIncident);

// ✅ Get all incidents (no admin block for now)
router.get("/", getAllIncidents);

// ✅ Dashboard stats
router.get("/dashboard", getDashboardStats);

// ✅ Search/filter
router.get("/search", getFilteredIncidents);

// ✅ Threat stats (chart data)
router.get("/threat-stats", getThreatStats);

// ✅ Update status
router.patch("/:id/status", updateIncidentStatus);

// ✅ Community alerts (ONLY ONE ROUTE)
router.get("/alerts", getCommunityAlerts);

export default router;