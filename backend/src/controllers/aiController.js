import Incident from "../models/Incident.js";
import { analyzeIncident } from "../utils/aiAnalysis.js";

/* ===============================
   🧠 NORMALIZE THREAT TYPE
================================ */
const normalizeThreat = (type = "") => {
  const t = type.toLowerCase();

  if (t.includes("phish")) return "Phishing";
  if (t.includes("scam")) return "Scam";
  if (t.includes("malware")) return "Malware";

  return "Other";
};

/* ===============================
   🚀 AI INSIGHTS CONTROLLER
================================ */
export const getAIInsights = async (req, res) => {
  try {
    // 🔥 GET RECENT INCIDENTS
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(20);

    // ❗ HANDLE EMPTY DATA
    if (!incidents.length) {
      return res.json({
        insights: [
          {
            threatType: "None",
            confidence: 0,
            explanation: "No threat data available yet.",
            recommendation: "System is currently safe.",
          },
        ],
      });
    }

    // 🔥 PREPARE DATA FOR AI
    const combinedText = incidents
      .map((i) => `${i.threatType}: ${i.description}`)
      .join("\n");

    // 🤖 AI ANALYSIS
    const aiResponse = await analyzeIncident(combinedText);

    let parsed;

    try {
      // 🔥 CLEAN RESPONSE (REMOVE MARKDOWN)
      const clean = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(clean);

    } catch {
      parsed = {
        threatType: "Other",
        confidence: 50,
        explanation: "AI parsing failed",
        recommendation: "Stay cautious",
      };
    }

    // 🔥 NORMALIZE THREAT TYPE
    parsed.threatType = normalizeThreat(parsed.threatType);

    // 🔥 SAFE CONFIDENCE
    parsed.confidence =
      parseInt(parsed.confidence?.toString().replace("%", "")) || 50;

    // 🔍 DEBUG LOG
    console.log("🧠 AI Insights:", parsed);

    // ✅ RESPONSE (CLEAN STRUCTURE)
    res.json({
      insights: [parsed],
    });

  } catch (error) {
    console.error("🔥 AI Insights Error:", error.message);

    res.status(500).json({
      message: "Failed to generate AI insights",
    });
  }
};