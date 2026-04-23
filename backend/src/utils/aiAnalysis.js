import OpenAI from "openai";

export const analyzeIncident = async (content) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
  You are a cybersecurity AI system.

  Analyze the content below and determine if it is a cyber threat.

  Content:
  "${content}"

  Instructions:
  - Respond ONLY with valid JSON
  - Do NOT include markdown (no backticks)
  - Do NOT include any extra text outside JSON
  - Use ONLY the specified format

  Rules:
  - "threatType" must be one of: Phishing, Scam, Malware, Other
  - "confidence" must be a NUMBER between 0 and 100 (no words like High/Low)
  - Keep explanation clear and concise

  Output format:
  {
    "threatType": "Phishing | Scam | Malware | Other",
    "confidence": 0,
    "explanation": "",
    "recommendation": ""
  }
  `;
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  return response.output[0].content[0].text;
};