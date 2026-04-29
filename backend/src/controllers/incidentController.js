// controllers/incidentController.js
import Incident from "../models/Incident.js";
import { generateAlerts } from "../utils/generateAlerts.js";
import { getSafetyTips } from "../utils/safetyTips.js";
import { analyzeIncident } from "../utils/aiAnalysis.js";
import {
  validateIncidentInput,
  validateStatus,
  validateSearchQuery,
} from "../utils/validators.js";

const LIST_LIMIT = 20;

/* ===============================
   ✅ CREATE INCIDENT (AI-ONLY)
================================ */
export const createIncident = async (req, res) => {
  try {
    const { description, location } = req.body;

    const validation = validateIncidentInput({ description, location });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    console.log("📩 Incoming incident:", description);

    // analyzeIncident now returns a parsed object — no JSON.parse needed
    const parsed = await analyzeIncident(description);

    const threatType   = parsed.threatType    || "Other";
    const confidence   = Number(parsed.confidence) || 50;   // always a number
    const reason       = parsed.explanation   || "AI analysis";
    const recommendation = parsed.recommendation || "";

    const newIncident = await Incident.create({
      name: "System AI Detection",
      description,
      threatType,
      confidence,
      reason,
      location: location || "Unknown",
      status: threatType === "Safe" ? "safe" : "pending",
    });

    // Real-time socket alert (skip "Safe" to reduce noise)
    if (threatType !== "Safe") {
      const io = req.app.get("io");
      if (io) io.emit("new-threat", newIncident);
    }

    return res.status(201).json({
      success: true,
      message: "Incident analyzed successfully",
      threat: {
        type: threatType,
        confidence,
        risk:
          confidence > 70 ? "HIGH" :
          confidence > 40 ? "MEDIUM" : "LOW",
        reason,
      },
      recommendation,
      tips: getSafetyTips(threatType),
      data: newIncident,
    });

  } catch (error) {
    console.error("🔥 createIncident error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   📥 GET ALL INCIDENTS
================================ */
export const getAllIncidents = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(LIST_LIMIT, parseInt(req.query.limit) || LIST_LIMIT);
    const skip  = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      Incident.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Incident.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: incidents,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   📊 DASHBOARD STATS
================================ */
export const getDashboardStats = async (req, res) => {
  try {
    // Single aggregation instead of loading every document into memory
    const [countResult, typeStats, recentIncidents] = await Promise.all([
      Incident.countDocuments(),
      Incident.aggregate([
        { $group: { _id: "$threatType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Incident.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalReports = countResult;
    const mostCommonThreat = typeStats[0]?._id || "No data";

    return res.status(200).json({
      success: true,
      totalReports,
      mostCommonThreat,
      threatBreakdown: typeStats.map((s) => ({
        threatType: s._id,
        count: s.count,
      })),
      recentIncidents,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   🔄 UPDATE INCIDENT STATUS
================================ */
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validation = validateStatus(status);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const updated = await Incident.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   🔍 FILTER INCIDENTS
================================ */
export const getFilteredIncidents = async (req, res) => {
  try {
    const { search = "", threatType = "", status = "" } = req.query;

    if (!validateSearchQuery(search)) {
      return res.status(400).json({ success: false, message: "Invalid search query" });
    }

    const query = {};
    if (threatType) query.threatType = threatType;
    if (status)     query.status     = status;
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT);

    return res.status(200).json({ success: true, data: incidents });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   📊 THREAT STATS (FOR CHARTS)
================================ */
export const getThreatStats = async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      { $group: { _id: "$threatType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: stats.map((s) => ({ threatType: s._id, count: s.count })),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   🚨 COMMUNITY ALERTS
================================ */
export const getCommunityAlerts = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(50);                     // cap what generateAlerts processes

    const alerts = generateAlerts(incidents);

    return res.status(200).json({ success: true, data: alerts });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};