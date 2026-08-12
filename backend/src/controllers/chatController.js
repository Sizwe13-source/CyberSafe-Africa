// controllers/chatController.js
import OpenAI from "openai";
import { analyzeWithRules } from "../utils/aiAnalysis.js";

const SYSTEM_PROMPT = `You are CyberSafe Africa Assistant — a helpful cybersecurity guide for learners and communities in Africa (especially South Africa).

Your job:
- Explain phishing, scams, malware, password safety, public Wi‑Fi risks, identity theft, and POPIA rights in plain language.
- Help people decide what to do next when they receive a suspicious message or link.
- Never ask for passwords, OTPs, ID numbers, or full card details.
- If someone is in immediate danger, tell them to contact local emergency services / SAPS.
- Keep answers concise (under ~180 words), practical, and calm.
- Prefer South African examples (banks, SARS, WhatsApp, USSD) when relevant.
`;

const KNOWLEDGE = [
  {
    keys: ["password", "strong password", "passphrase"],
    reply:
      "Use a long passphrase (12+ characters) you have not used elsewhere. Mix words, a number, and a symbol — avoid birthdays and common words. Turn on multi-factor authentication (MFA) wherever possible, and use a password manager so you do not reuse passwords.",
  },
  {
    keys: ["phishing", "bank", "otp", "sms", "text"],
    reply:
      "Treat unexpected bank/SARS messages as suspicious. Real banks never ask for your OTP, PIN, or full card number by SMS or WhatsApp. Do not click the link — open your bank app yourself or call the number on the back of your card. If you already shared an OTP, contact your bank immediately and change your password.",
  },
  {
    keys: ["popia", "privacy", "personal information"],
    reply:
      "POPIA (Protection of Personal Information Act) is South Africa’s data-protection law. Organisations must only collect personal info for a lawful purpose, keep it secure, and not share it without a good reason. You can ask what they hold about you and request corrections. For breaches at work, report them to your supervisor and keep a written record.",
  },
  {
    keys: ["wifi", "wi-fi", "public", "café", "cafe", "airport"],
    reply:
      "On public Wi‑Fi, avoid logging into banking or email unless you use a trusted VPN. Prefer your mobile data for sensitive tasks. Check the network name with staff — fake hotspots often mimic café names. Turn off auto-join for open networks when you can.",
  },
  {
    keys: ["identity", "id number", "stolen identity"],
    reply:
      "If someone is misusing your ID number: keep screenshots/evidence, report it to SAPS, alert your bank and credit bureaus, and consider a fraud alert. Do not share your ID photos or OTP codes with anyone who contacts you first. For urgent help, use official government or bank channels only.",
  },
  {
    keys: ["sars", "refund", "tax"],
    reply:
      "SARS refund scams are common. SARS will not ask you to pay a fee to receive a refund, and will not demand your banking PIN/OTP via SMS. Verify via the official SARS eFiling site or app — type the address yourself, do not use links from messages.",
  },
];

function localReply(userText = "") {
  const lower = userText.toLowerCase();
  const hit = KNOWLEDGE.find((k) => k.keys.some((key) => lower.includes(key)));
  if (hit) return hit.reply;

  const analysis = analyzeWithRules(userText);
  if (analysis.threatType !== "Safe") {
    return `This looks like a possible ${analysis.threatType} (${analysis.confidence}% confidence).\n\n${analysis.explanation}\n\nWhat to do: ${analysis.recommendation}\n\nYou can also paste the full message into our Scam Checker or report it via Incident Report.`;
  }

  return "I can help with phishing, password safety, public Wi‑Fi, identity theft, SARS scams, and POPIA rights. Tell me what happened (without sharing passwords or OTPs), or try one of the suggestion chips.";
}

export const chat = async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "messages array is required",
      });
    }

    const sanitized = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1500),
      }))
      .slice(-12);

    if (!sanitized.length) {
      return res.status(400).json({
        success: false,
        message: "No valid messages provided",
      });
    }

    const lastUser = [...sanitized].reverse().find((m) => m.role === "user");
    const fallback = localReply(lastUser?.content || "");

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ success: true, reply: fallback, source: "local" });
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
        temperature: 0.4,
        max_tokens: 350,
      });

      const reply =
        response.choices?.[0]?.message?.content?.trim() || fallback;

      return res.json({ success: true, reply, source: "openai" });
    } catch (err) {
      console.error("⚠️ Chat OpenAI failed, using local reply:", err.message);
      return res.json({ success: true, reply: fallback, source: "local" });
    }
  } catch (error) {
    console.error("🔥 chat error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Chat failed",
    });
  }
};
