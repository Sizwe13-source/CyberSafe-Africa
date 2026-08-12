// utils/aiAnalysis.js
// OpenAI-backed threat analysis with a local rule-based fallback so the
// app keeps working when the API key is missing or the provider is down.

import OpenAI from "openai";

const KNOWN_TYPES = [
  "Phishing",
  "Scam",
  "Malware",
  "Threat",
  "Bullying",
  "Safe",
  "Other",
];

const RULE_SIGNALS = {
  Phishing: [
    "verify your account",
    "confirm your identity",
    "unusual activity",
    "suspended",
    "login",
    "password",
    "credentials",
    "click here to verify",
    "update your details",
  ],
  Scam: [
    "otp",
    "pin",
    "send money",
    "lottery",
    "you've won",
    "you have won",
    "claim your prize",
    "gift card",
    "western union",
    "bitcoin",
    "airtime",
    "sars refund",
    "act now",
    "urgent",
  ],
  Malware: [
    "download",
    ".apk",
    ".exe",
    "install now",
    "macro enabled",
    "enable content",
  ],
  Threat: [
    "i will find you",
    "you will pay",
    "kill you",
    "hurt you",
    "attack you",
  ],
  Bullying: [
    "kill yourself",
    "nobody likes you",
    "stupid",
    "idiot",
    "loser",
  ],
};

function normalizeThreatType(type = "") {
  const t = String(type).trim().toLowerCase();
  return KNOWN_TYPES.find((k) => k.toLowerCase() === t) || "Other";
}

function clampConfidence(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/**
 * Fast local scoring — used as fallback and as a baseline when AI is available.
 */
export function analyzeWithRules(content = "") {
  const text = String(content).toLowerCase();
  if (!text.trim()) {
    return {
      threatType: "Other",
      confidence: 40,
      explanation: "No content provided for analysis.",
      recommendation: "Provide the full message or URL for a better assessment.",
      source: "rules",
    };
  }

  let bestType = "Safe";
  let bestHits = 0;
  let matched = [];

  for (const [type, signals] of Object.entries(RULE_SIGNALS)) {
    const hits = signals.filter((s) => text.includes(s));
    if (hits.length > bestHits) {
      bestHits = hits.length;
      bestType = type;
      matched = hits;
    }
  }

  // SA-specific extras
  const saExtras = [];
  if (/sars.*(refund|owe|debt)/i.test(text)) saExtras.push("SARS impersonation wording");
  if (/\b(fnb|absa|nedbank|capitec|standard bank)\b/i.test(text) && /\b(otp|verify|pin|password)\b/i.test(text)) {
    saExtras.push("SA bank + credential request");
  }
  if (/\*\d{3,5}#/.test(text) || /ussd/i.test(text)) saExtras.push("USSD / shortcode pressure");
  if (/whatsapp.*(gift|win|prize)/i.test(text)) saExtras.push("WhatsApp prize scam pattern");

  if (saExtras.length && bestType === "Safe") {
    bestType = "Scam";
    bestHits = Math.max(bestHits, saExtras.length);
    matched = saExtras;
  } else if (saExtras.length) {
    matched = [...matched, ...saExtras];
    bestHits += saExtras.length;
  }

  if (bestHits === 0) {
    return {
      threatType: "Safe",
      confidence: 85,
      explanation: "No common scam or threat patterns were detected in this content.",
      recommendation: "Stay cautious with unexpected requests for money, OTPs, or personal details.",
      source: "rules",
    };
  }

  const confidence = Math.min(95, 45 + bestHits * 15);
  return {
    threatType: bestType,
    confidence,
    explanation: `Matched ${bestHits} signal(s): ${matched.slice(0, 4).join(", ")}.`,
    recommendation:
      bestType === "Phishing" || bestType === "Scam"
        ? "Do not click links or share OTPs. Contact the organisation via an official channel you already trust."
        : bestType === "Malware"
          ? "Do not download or open attachments from unknown sources. Scan the device if you already did."
          : bestType === "Threat" || bestType === "Bullying"
            ? "Preserve evidence, block the sender, and report to a trusted adult, school, or the police if you feel unsafe."
            : "Treat this as suspicious and verify independently before acting.",
    source: "rules",
  };
}

function parseAiJson(raw) {
  const cleaned = String(raw || "")
    .replace(/```json|```/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return {
    threatType: normalizeThreatType(parsed.threatType),
    confidence: clampConfidence(parsed.confidence),
    explanation: String(parsed.explanation || "AI analysis").slice(0, 500),
    recommendation: String(parsed.recommendation || "Stay cautious.").slice(0, 500),
    source: "openai",
  };
}

/**
 * Analyze content for cyber threats.
 * Prefers OpenAI when configured; always falls back to local rules on failure.
 */
export const analyzeIncident = async (content) => {
  const fallback = analyzeWithRules(content);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are a cybersecurity AI system for an African student learning platform.

Analyze the content below and determine if it is a cyber threat or harmful message.

Content:
"${String(content).slice(0, 2000)}"

Instructions:
- Respond ONLY with valid JSON
- Do NOT include markdown (no backticks)
- Do NOT include any extra text outside JSON
- Use ONLY the specified format

Rules:
- "threatType" must be one of: Phishing, Scam, Malware, Threat, Bullying, Safe, Other
- "confidence" must be a NUMBER between 0 and 100
- If the content is normal and harmless, set threatType to "Safe" and confidence to 95
- Keep explanation clear and concise
- Prefer South African context (banks, SARS, mobile money, WhatsApp scams) when relevant

Output format:
{
  "threatType": "Phishing",
  "confidence": 0,
  "explanation": "",
  "recommendation": ""
}
`;

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = response.choices?.[0]?.message?.content?.trim() || "";
    const aiResult = parseAiJson(raw);

    // If rules found a strong signal and AI said Safe, prefer the stronger signal.
    if (fallback.threatType !== "Safe" && aiResult.threatType === "Safe" && fallback.confidence >= 70) {
      return { ...fallback, explanation: `${fallback.explanation} (AI was uncertain; rules retained.)` };
    }

    return aiResult;
  } catch (err) {
    console.error("⚠️ OpenAI analyzeIncident failed, using rules:", err.message);
    return fallback;
  }
};
