// utils/aiAnalysis.js
import OpenAI from "openai";

export const analyzeIncident = async (content) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are a cybersecurity AI system for an African student learning platform.

Analyze the content below and determine if it is a cyber threat or harmful message.

Content:
"${content}"

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

Output format:
{
  "threatType": "Phishing | Scam | Malware | Threat | Bullying | Safe | Other",
  "confidence": 0,
  "explanation": "",
  "recommendation": ""
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1,       // low = more consistent, predictable outputs
    max_tokens: 300,
  });

  const raw = response.choices[0].message.content.trim();

  // Safety parse — strip accidental backticks just in case
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If parsing fails, return a safe fallback so the app doesn't crash
    console.error("AI response parse error. Raw output:", raw);
    return {
      threatType: "Other",
      confidence: 50,
      explanation: "Could not parse AI response.",
      recommendation: "Review manually.",
    };
  }
};