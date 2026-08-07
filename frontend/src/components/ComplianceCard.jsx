// components/ComplianceCard.jsx
import { memo } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const ACTS = [
  {
    name: "Electronic Communications and Transactions Act 25 of 2002",
    short: "ECTA",
    note: "Lawful electronic communications and transactions",
  },
  {
    name: "Protection of Personal Information Act 4 of 2013",
    short: "POPIA",
    note: "Responsible handling of personal information",
  },
  {
    name: "Cybercrimes Act 19 of 2020",
    short: "Cybercrimes Act",
    note: "Detection and reporting of cybercrime activity",
  },
];

const ComplianceCard = memo(function ComplianceCard() {
  return (
    <motion.div variants={fadeUp} style={{
      background: "rgba(255,255,255,0.015)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "20px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(52,211,153,0.15)",
            border: "1px solid rgba(52,211,153,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>🛡</div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            Security &amp; Compliance
          </h2>
        </div>

        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "#34d399", background: "rgba(52,211,153,0.1)",
          border: "1px solid rgba(52,211,153,0.3)",
          padding: "3px 10px", borderRadius: 999, textTransform: "uppercase",
        }}>
          Compliant
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", lineHeight: 1.6 }}>
        CyberSafe Africa operates in line with South African cyber legislation.
        Threat detection, incident reporting, and the handling of user activity
        on this platform are conducted in accordance with the principles of the
        Acts below.
      </p>

      {/* Acts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ACTS.map((act) => (
          <div key={act.short} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderLeft: "2px solid #34d399",
            borderRadius: 10,
            padding: "12px 16px",
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                {act.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                {act.note}
              </p>
            </div>
            <span style={{ color: "#34d399", fontSize: 14, flexShrink: 0 }}>✓</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default ComplianceCard;