// controllers/activityController.js
import { analyzeIncident } from "../utils/aiAnalysis.js";
import Incident from "../models/Incident.js";
import { validateActivityInput } from "../utils/validators.js";

/* ===============================
   🔍 SMART RULE DETECTION
   Requires 2+ signals to fire,
   so single common words don't
   trigger false positives.
================================ */
const SIGNALS = {
  Phishing: ["verify", "account", "login", "bank", "password", "credentials"],
  Scam:     ["otp", "urgent", "send money", "lottery", "won", "claim", "reward"],
  Malware:  ["download", ".apk", ".exe", "install now", "click here"],
  Threat:   ["i will find you", "you will pay", "kill", "hurt", "attack"],
  Bullying: ["stupid", "idiot", "loser", "nobody likes you", "kill yourself"],
};

const detectThreat = (text = "", url = "") => {
  const content = `${text} ${url}`.toLowerCase();

  for (const [type, signals] of Object.entries(SIGNALS)) {
    const hits = signals.filter((word) => content.includes(word)).length;
    // Threat/Bullying only need 1 match — they're high-signal words
    const threshold = ["Threat", "Bullying"].includes(type) ? 1 : 2;
    if (hits >= threshold) return type;
  }

  return null;
};

/* ===============================
   🧠 NORMALIZE THREAT TYPE
   Exact-match against known list
   to avoid false partial matches.
================================ */
const KNOWN_TYPES = ["Phishing", "Scam", "Malware", "Threat", "Bullying", "Safe", "Other"];

const normalizeThreat = (type = "") => {
  const t = type.trim().toLowerCase();
  return KNOWN_TYPES.find((k) => k.toLowerCase() === t) || "Other";
};

/* ===============================
   🔢 SAFE CONFIDENCE PARSER
================================ */
const parseConfidence = (value) => {
  if (value == null) return 50;
  const n = Number(value);
  if (!isNaN(n)) return Math.min(100, Math.max(0, n));  // clamp 0-100
  return 50;
};

/* ===============================
   🚀 MAIN CONTROLLER
================================ */
export const analyzeActivity = async (req, res) => {
  try {
    const { type, text = "", url = "" } = req.body;

    const validation = validateActivityInput({ type, text, url });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity input",
        errors: validation.errors,
      });
    }

    const content = (text || url).trim();
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "No valid content provided",
      });
    }

    console.log("📩 Incoming activity:", content);

    // Step 1: fast rule check
    const ruleThreat = detectThreat(text, url);

    // Step 2: AI analysis — returns parsed object, no JSON.parse needed
    const parsed = await analyzeIncident(content);

    const aiThreatType = normalizeThreat(parsed.threatType);
    const confidence   = parseConfidence(parsed.confidence);

    // Rule-based takes priority if it fired; otherwise trust the AI
    const finalThreatType = ruleThreat || aiThreatType;
    const isSafe = finalThreatType === "Safe" || confidence < 40;

    console.log("🧠 Detection:", { ruleThreat, aiThreat: aiThreatType, final: finalThreatType, confidence });

    const threat = {
      type:       finalThreatType,
      confidence,
      risk:       confidence > 70 ? "HIGH" : confidence > 40 ? "MEDIUM" : "LOW",
      reason:     parsed.explanation    || "AI analysis",
      source:     type,
      message:    isSafe
        ? "✅ No threat detected"
        : `⚠️ ${finalThreatType} detected (${confidence}% confidence)`,
    };

    // Only save to DB if it's actually a threat — don't pollute the DB with safe activity
    let newIncident = null;
    if (!isSafe) {
      newIncident = await Incident.create({
        description: content,
        threatType:  finalThreatType,
        confidence,
        reason:      threat.reason,
        source:      type,
        location:    req.body.location || "Unknown",
        status:      "pending",
      });

      // Only emit real threats to the dashboard
      const io = req.app.get("io");
      if (io) io.emit("new-threat", newIncident);
    }

    return res.json({
      success:        true,
      alert:          !isSafe,
      threat,
      recommendation: parsed.recommendation || (isSafe ? "Content looks safe." : "Stay cautious."),
      data:           newIncident,
    });

  } catch (error) {
    console.error("🔥 analyzeActivity error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};