import { analyzeIncident } from "../utils/aiAnalysis.js";
import Incident from "../models/Incident.js";
import { validateActivityInput } from "../utils/validators.js";

/* ===============================
   🔍 SMART RULE DETECTION
================================ */
const detectThreat = (text = "", url = "") => {
  const content = `${text} ${url}`.toLowerCase();

  const phishingSignals = ["verify", "account", "login", "bank"];
  const scamSignals = ["otp", "urgent", "send money", "lottery", "won"];
  const malwareSignals = ["download", "apk", "file"];

  const phishingMatches = phishingSignals.filter(word => content.includes(word)).length;
  const scamMatches = scamSignals.filter(word => content.includes(word)).length;
  const malwareMatches = malwareSignals.filter(word => content.includes(word)).length;

  if (phishingMatches >= 2) return "Phishing";
  if (scamMatches >= 2) return "Scam";
  if (malwareMatches >= 2) return "Malware";

  return null;
};

/* ===============================
   🧠 NORMALIZE AI OUTPUT
================================ */
const normalizeThreat = (type = "") => {
  const t = type.toLowerCase();

  if (t.includes("phish")) return "Phishing";
  if (t.includes("scam")) return "Scam";
  if (t.includes("malware")) return "Malware";

  return "Other";
};

/* ===============================
   🔢 SAFE CONFIDENCE PARSER
================================ */
const parseConfidence = (value) => {
  if (!value) return 50;

  const v = value.toString().toLowerCase();

  if (v.includes("high")) return 85;
  if (v.includes("medium")) return 60;
  if (v.includes("low")) return 30;

  return parseInt(v.replace("%", "")) || 50;
};

/* ===============================
   🚀 MAIN CONTROLLER
================================ */
export const analyzeActivity = async (req, res) => {
  try {
    const { type, text = "", url } = req.body;

    // ✅ VALIDATION
    const validation = validateActivityInput({ type, text, url });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity input",
        errors: validation.errors,
      });
    }

    const content = text || url;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "No valid content provided",
      });
    }

    console.log("📩 Incoming activity:", content);

    // 🔥 RULE DETECTION
    const ruleThreat = detectThreat(text, url);

    // 🤖 AI ANALYSIS
    const aiResult = await analyzeIncident(content);

    let parsed;

    try {
      // 🔥 CLEAN AI RESPONSE (REMOVE MARKDOWN)
      const clean = aiResult
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

    // 🔥 NORMALIZE + FINAL DECISION
    const finalThreatType = ruleThreat || normalizeThreat(parsed.threatType);

    const confidence = parseConfidence(parsed.confidence);

    const threat = {
      type: finalThreatType,
      message: `⚠️ ${finalThreatType} threat detected (${confidence}% confidence)`,
      risk:
        confidence > 70
          ? "HIGH"
          : confidence > 40
          ? "MEDIUM"
          : "LOW",
      confidence,
      reason: parsed.explanation || "AI analysis",
      source: type,
    };

    // 🔍 DEBUG LOG
    console.log("🧠 Detection:", {
      ruleThreat,
      aiThreat: parsed.threatType,
      final: finalThreatType,
      confidence,
    });

    // 💾 SAVE INCIDENT
    const newIncident = await Incident.create({
      description: content,
      threatType: threat.type,
      confidence: threat.confidence,
      reason: threat.reason,
      source: type,
      timestamp: new Date(),
    });

    // 🔥 REAL-TIME EVENT
    const io = req.app.get("io");
    if (io) io.emit("new-threat", newIncident);

    // ✅ RESPONSE
    return res.json({
      success: true,
      alert: true,
      threat,
      recommendation: parsed.recommendation || "Stay cautious",
      data: newIncident,
    });

  } catch (error) {
    console.error("🔥 ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};