// src/utils/generateAlerts.js

const PRIORITY_ORDER = { critical: 3, warning: 2, low: 1 };

export const generateAlerts = (incidents) => {
  if (!incidents || incidents.length === 0) return [];

  // Group by threatType + location
  const grouped = {};

  incidents.forEach((incident) => {
    // Never surface "Safe" detections as alerts
    if (incident.threatType === "Safe") return;

    const confidence = Number(incident.confidence) || 0;

    // Skip low-confidence noise
    if (confidence < 50) return;

    const key = `${incident.threatType}-${incident.location || "Unknown"}`;

    if (!grouped[key]) {
      grouped[key] = {
        threatType:    incident.threatType,
        location:      incident.location || "Unknown",
        count:         0,
        maxConfidence: 0,
        latestAt:      null,
      };
    }

    grouped[key].count        += 1;
    grouped[key].maxConfidence = Math.max(grouped[key].maxConfidence, confidence);

    // Track the most recent incident time for the group
    const ts = incident.createdAt ? new Date(incident.createdAt) : null;
    if (ts && (!grouped[key].latestAt || ts > grouped[key].latestAt)) {
      grouped[key].latestAt = ts;
    }
  });

  return Object.values(grouped)
    .map((g) => {
      let priority = "low";
      if (g.maxConfidence > 85 || g.count >= 5) priority = "critical";
      else if (g.maxConfidence > 70 || g.count >= 3) priority = "warning";

      return {
        threatType: g.threatType,
        location:   g.location,
        count:      g.count,
        confidence: g.maxConfidence,
        // Risk label matches what the rest of your backend produces
        risk:       g.maxConfidence >= 90 ? "HIGH" : g.maxConfidence >= 70 ? "MEDIUM" : "LOW",
        priority,
        message:    `⚠️ ${g.threatType} detected ${g.count} time(s) in ${g.location}`,
        latestAt:   g.latestAt,
      };
    })
    .sort(
      (a, b) =>
        PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority] ||
        b.count - a.count
    )
    .slice(0, 10); // top 10 — dashboard can slice further if needed
};
