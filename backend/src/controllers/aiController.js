// controllers/aiController.js
import Incident from "../models/Incident.js";
import { analyzeIncident } from "../utils/aiAnalysis.js";

/* ===============================
   🧠 NORMALIZE THREAT TYPE
================================ */
const KNOWN_TYPES = ["Phishing", "Scam", "Malware", "Threat", "Bullying", "Safe", "Other"];

const normalizeThreat = (type = "") => {
  const t = type.trim().toLowerCase();
  const match = KNOWN_TYPES.find((k) => k.toLowerCase() === t);
  return match || "Other";
};

/* ===============================
   🚀 AI INSIGHTS — PER INCIDENT
================================ */
export const getAIInsights = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(10);                       // 10 is enough — each gets its own AI call

    if (!incidents.length) {
      return res.json({
        insights: [],
        message: "No incidents to analyze yet.",
      });
    }

    // Analyze each incident individually so we get specific, accurate results
    const insights = await Promise.all(
      incidents.map(async (incident) => {
        try {
          // analyzeIncident already returns a parsed object — no JSON.parse needed
          const parsed = await analyzeIncident(incident.description);

          return {
            incidentId:     incident._id,
            description:    incident.description,
            location:       incident.location,
            threatType:     normalizeThreat(parsed.threatType),
            confidence:     Number(parsed.confidence) || 50,
            explanation:    parsed.explanation    || "No explanation provided.",
            recommendation: parsed.recommendation || "Stay cautious.",
            createdAt:      incident.createdAt,
          };

        } catch (err) {
          // If one AI call fails, don't crash the whole batch
          console.error(`⚠️ AI failed for incident ${incident._id}:`, err.message);
          return {
            incidentId:     incident._id,
            description:    incident.description,
            location:       incident.location,
            threatType:     normalizeThreat(incident.threatType),
            confidence:     incident.confidence || 50,
            explanation:    "AI analysis unavailable for this incident.",
            recommendation: "Review manually.",
            createdAt:      incident.createdAt,
          };
        }
      })
    );

    console.log(`🧠 AI Insights generated for ${insights.length} incidents`);

    return res.json({
      success: true,
      total:   insights.length,
      insights,
    });

  } catch (error) {
    console.error("🔥 AI Insights Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI insights",
    });
  }
};

/* ===============================
   📊 AI SUMMARY (FOR DASHBOARD)
   One high-level summary across
   all recent incidents combined.
================================ */
export const getAISummary = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(20);

    if (!incidents.length) {
      return res.json({
        success: true,
        summary: "No incidents recorded yet. The platform appears safe.",
      });
    }

    // Count threat types for a quick breakdown
    const breakdown = incidents.reduce((acc, i) => {
      const type = normalizeThreat(i.threatType);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const topThreat = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])[0];

    const avgConfidence = Math.round(
      incidents.reduce((sum, i) => sum + (Number(i.confidence) || 0), 0) / incidents.length
    );

    return res.json({
      success:       true,
      total:         incidents.length,
      avgConfidence,
      topThreat:     topThreat ? { type: topThreat[0], count: topThreat[1] } : null,
      breakdown,
    });

  } catch (error) {
    console.error("🔥 AI Summary Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI summary",
    });
  }
};