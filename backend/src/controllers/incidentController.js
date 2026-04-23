import Incident from "../models/Incident.js";
import { generateAlerts } from "../utils/generateAlerts.js";
import { getSafetyTips } from "../utils/safetyTips.js";
import { analyzeIncident } from "../utils/aiAnalysis.js";
import {
  validateIncidentInput,
  validateStatus,
  validateSearchQuery
} from "../utils/validators.js";

/* ===============================
   ✅ CREATE INCIDENT (AI-ONLY)
================================ */
export const createIncident = async (req, res) => {
  try {
    const { description, location } = req.body;

    // 🔍 Validate input
    const validation = validateIncidentInput({ description, location });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }

    console.log("📩 Incoming incident:", description);

    // 🤖 AI analysis
    const aiResult = await analyzeIncident(description);

    let parsed;

    try {
      parsed = JSON.parse(aiResult);
    } catch (err) {
      console.error("⚠️ AI JSON parse failed:", aiResult);

      parsed = {
        threatType: "Other",
        confidence: "50",
        explanation: "AI parsing failed",
        recommendation: "Proceed with caution"
      };
    }

    const threatType = parsed.threatType || "Other";
    const confidence = parseInt(parsed.confidence) || 50;
    const reason = parsed.explanation || "AI analysis";

    // 💾 Save to DB
    const newIncident = await Incident.create({
      name: "System AI Detection",
      description,
      threatType,
      confidence,
      reason,
      location: location || "Unknown",
      status: threatType === "Safe" ? "safe" : "pending"
    });

    // ⚡ Real-time alert
    const io = req.app.get("io");
    if (io) {
      io.emit("new-threat", newIncident);
    }

    return res.status(201).json({
      success: true,
      message: "Incident analyzed successfully",
      threat: {
        type: threatType,
        confidence,
        risk:
          confidence > 70
            ? "HIGH"
            : confidence > 40
            ? "MEDIUM"
            : "LOW",
        reason
      },
      recommendation: parsed.recommendation,
      tips: getSafetyTips(threatType),
      data: newIncident
    });

  } catch (error) {
    console.error("🔥 ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   📥 GET ALL INCIDENTS
================================ */
export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: incidents.slice(0, 20)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   📊 DASHBOARD STATS
================================ */
export const getDashboardStats = async (req, res) => {
  try {
    const incidents = await Incident.find();

    const totalReports = incidents.length;

    const threatCounts = {};
    incidents.forEach((i) => {
      const type = i.threatType || "Other";
      threatCounts[type] = (threatCounts[type] || 0) + 1;
    });

    let mostCommonThreat = "No data";

    if (totalReports > 0) {
      mostCommonThreat = Object.keys(threatCounts).reduce((a, b) =>
        threatCounts[a] > threatCounts[b] ? a : b
      );
    }

    return res.status(200).json({
      success: true,
      totalReports,
      mostCommonThreat,
      recentIncidents: incidents.slice(0, 5)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   🔄 UPDATE INCIDENT STATUS
================================ */
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validation = validateStatus(status);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const updated = await Incident.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   🔍 FILTER INCIDENTS
================================ */
export const getFilteredIncidents = async (req, res) => {
  try {
    const { search = "", threatType = "", status = "" } = req.query;

    if (!validateSearchQuery(search)) {
      return res.status(400).json({
        success: false,
        message: "Invalid search query"
      });
    }

    const query = {};

    if (threatType) query.threatType = threatType;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const incidents = await Incident.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: incidents.slice(0, 20)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   📊 THREAT STATS (FOR CHARTS)
================================ */
export const getThreatStats = async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: "$threatType",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats.map((s) => ({
        threatType: s._id,
        count: s.count
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   🚨 COMMUNITY ALERTS
================================ */
export const getCommunityAlerts = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });

    const alerts = generateAlerts(incidents);

    return res.status(200).json({
      success: true,
      data: alerts
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};