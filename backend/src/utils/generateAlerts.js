// src/utils/generateAlerts.js

export const generateAlerts = (incidents) => {
  if (!incidents || incidents.length === 0) return [];

  // 🔥 GROUP BY threatType + location
  const grouped = {};

  incidents.forEach((i) => {
    const key = `${i.threatType}-${i.location || "Unknown"}`;

    if (!grouped[key]) {
      grouped[key] = {
        threatType: i.threatType,
        location: i.location || "Unknown",
        count: 0,
        maxConfidence: 0
      };
    }

    grouped[key].count += 1;
    grouped[key].maxConfidence = Math.max(
      grouped[key].maxConfidence,
      i.confidence
    );
  });

  // 🔥 CREATE ALERTS
  const alerts = Object.values(grouped)
    .filter((g) => g.maxConfidence >= 50) // include medium+ threats
    .map((g) => {
      let priority = "low";

      if (g.maxConfidence > 85 || g.count >= 5) {
        priority = "critical";
      } else if (g.maxConfidence > 70 || g.count >= 3) {
        priority = "warning";
      }

      return {
        threatType: g.threatType,
        location: g.location,
        count: g.count,
        message: `⚠️ ${g.threatType} detected ${g.count} time(s) in ${g.location}`,
        priority
      };
    });

  // 🔥 SORT BY PRIORITY + COUNT
  const priorityOrder = {
    critical: 3,
    warning: 2,
    low: 1
  };

  return alerts
    .sort(
      (a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority] ||
        b.count - a.count
    )
    .slice(0, 5); // 🔥 limit top 5 alerts
};