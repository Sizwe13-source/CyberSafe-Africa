import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

/* ─────────────────────────────────────────
   THREAT DATA
───────────────────────────────────────── */
const THREATS = [
  {
    id: "01",
    title: "Phishing",
    tag: "SOCIAL",
    severity: 92,
    color: "#ef4444",
    description:
      "AI identifies deceptive communication patterns designed to extract sensitive credentials from unsuspecting targets.",
    detail: "Analyses URL entropy, sender reputation, header anomalies, and linguistic deception markers in real time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Malware",
    tag: "BINARY",
    severity: 88,
    color: "#e040fb",
    description:
      "Suspicious software behaviour detected through anomaly-based analysis of process trees and system calls.",
    detail: "Combines static signature matching with dynamic sandbox detonation and behavioural heuristics.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Password Attacks",
    tag: "AUTH",
    severity: 74,
    color: "#facc15",
    description:
      "Repeated authentication attempts detected and flagged as potential brute-force or credential stuffing threats.",
    detail: "Rate-based detection across distributed login endpoints, cross-referenced with known leaked credential databases.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Social Engineering",
    tag: "HUMAN",
    severity: 81,
    color: "#22d3ee",
    description:
      "Human-targeted manipulation attempts identified through behavioural profiling and conversational pattern analysis.",
    detail: "NLP models trained on known manipulation scripts, pretexting scenarios, and authority-impersonation tactics.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <circle cx="9" cy="7" r="4" />
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <path d="M19 8l2 2-2 2M23 10h-6" />
      </svg>
    ),
  },
  {
    id: "05",
    title: "Scam & Fraud",
    tag: "FINANCIAL",
    severity: 77,
    color: "#fb923c",
    description:
      "AI detects patterns in scam messages, fake calls, and fraudulent requests targeting individuals and organisations.",
    detail: "Cross-channel correlation across SMS, email, and voice — flagging known scam templates and novel variants.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <path d="M22 16.92V19a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.18 2 2 0 0 1 4 2h2.09a2 2 0 0 1 2 1.72c.12.9.37 1.78.73 2.6a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.82.36 1.7.61 2.6.73A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────
   SEVERITY BAR
───────────────────────────────────────── */
function SeverityBar({ pct, color, animate }) {
  return (
    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", width: 80 }}>
      <div style={{
        height: "100%",
        background: color,
        borderRadius: 2,
        width: animate ? `${pct}%` : "0%",
        transition: animate ? "width 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
        transitionDelay: "0.1s",
        boxShadow: `0 0 6px ${color}80`,
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   THREAT ROW
───────────────────────────────────────── */
function ThreatRow({ threat, index, inView }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "background 0.2s",
        background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        cursor: "default",
        overflow: "hidden",
      }}
    >
      {/* left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
        background: threat.color,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s",
        boxShadow: `0 0 12px ${threat.color}`,
      }} />

      {/* main row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr auto",
        gap: 20,
        alignItems: "center",
        padding: "20px 24px 20px 28px",
      }}>

        {/* index + icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
          }}>
            {threat.id}
          </span>
          <div style={{
            width: 36, height: 36,
            border: `1px solid ${threat.color}30`,
            background: `${threat.color}10`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: threat.color,
            transition: "all 0.2s",
            ...(hovered ? { borderColor: `${threat.color}60`, background: `${threat.color}18` } : {}),
          }}>
            {threat.icon}
          </div>
        </div>

        {/* content */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "-0.01em",
              margin: 0,
            }}>
              {threat.title}
            </h3>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.15em",
              color: threat.color,
              background: `${threat.color}15`,
              border: `1px solid ${threat.color}30`,
              padding: "2px 6px",
            }}>
              {threat.tag}
            </span>
          </div>
          <p style={{
            fontSize: 13,
            color: "rgba(226,232,240,0.45)",
            lineHeight: 1.6,
            margin: 0,
            fontFamily: "'Manrope', sans-serif",
          }}>
            {threat.description}
          </p>

          {/* expanded detail */}
          <div style={{
            overflow: "hidden",
            maxHeight: hovered ? 80 : 0,
            opacity: hovered ? 1 : 0,
            transition: "max-height 0.3s ease, opacity 0.25s ease",
          }}>
            <p style={{
              fontSize: 12,
              color: "rgba(226,232,240,0.3)",
              lineHeight: 1.6,
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.02em",
            }}>
              <span style={{ color: threat.color, marginRight: 6 }}>›</span>
              {threat.detail}
            </p>
          </div>
        </div>

        {/* severity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 90 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 20,
            fontWeight: 500,
            color: threat.color,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}>
            {threat.severity}
            <span style={{ fontSize: 11, opacity: 0.6 }}>%</span>
          </span>
          <SeverityBar pct={threat.severity} color={threat.color} animate={inView} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
            THREAT SCORE
          </span>
        </div>

      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   THREATS SECTION
───────────────────────────────────────── */
function Threats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 0 80px",
        background: "#04080f",
        fontFamily: "'Manrope', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap');
      `}</style>

      {/* bg grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 52 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: "0.2em",
              color: "rgba(34,211,238,0.5)",
              textTransform: "uppercase",
            }}>
              // Classification Index
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(34,211,238,0.1)", maxWidth: 120 }} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "#e2e8f0",
              margin: 0,
            }}>
              THREAT{" "}
              <span style={{ color: "#22d3ee", textShadow: "0 0 30px rgba(34,211,238,0.25)" }}>
                INTELLIGENCE
              </span>
            </h2>

            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/admin/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#e040fb",
                color: "#000",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "11px 22px",
                textDecoration: "none",
                transition: "all 0.2s",
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ea4cfc"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#e040fb"; e.currentTarget.style.transform = "none"; }}
              >
                Initiate Detection
              </Link>
              <Link to="/tips" style={{
                display: "inline-flex", alignItems: "center",
                border: "1px solid rgba(34,211,238,0.3)",
                color: "#22d3ee",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "11px 22px",
                textDecoration: "none",
                transition: "all 0.2s",
                background: "rgba(34,211,238,0.04)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,211,238,0.04)"; e.currentTarget.style.transform = "none"; }}
              >
                Safety Tips →
              </Link>
            </div>
          </div>

          <p style={{
            fontSize: 14,
            color: "rgba(226,232,240,0.38)",
            marginTop: 14,
            maxWidth: 520,
            lineHeight: 1.7,
            fontFamily: "'Manrope', sans-serif",
          }}>
            AI continuously monitors activity, detects anomalies, and classifies threats in real time.
            Hover any entry to expand its detection methodology.
          </p>
        </motion.div>

        {/* ── THREAT LIST ── */}
        <div style={{
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,14,26,0.6)",
          backdropFilter: "blur(8px)",
          overflow: "hidden",
        }}>
          {/* table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr auto",
            gap: 20,
            padding: "10px 24px 10px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
          }}>
            {["TYPE", "DESCRIPTION", "SCORE"].map((h, i) => (
              <span key={i} style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.2)",
                textAlign: i === 2 ? "right" : "left",
              }}>
                {h}
              </span>
            ))}
          </div>

          {THREATS.map((threat, i) => (
            <ThreatRow key={threat.id} threat={threat} index={i} inView={inView} />
          ))}
        </div>

        {/* ── BOTTOM CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 48,
            padding: "36px 40px",
            background: "rgba(8,14,26,0.8)",
            border: "1px solid rgba(224,64,251,0.15)",
            borderLeft: "3px solid #e040fb",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          {/* ambient glow */}
          <div style={{
            position: "absolute", top: "-40%", right: "-5%",
            width: "30%", height: "200%",
            background: "radial-gradient(circle, rgba(224,64,251,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: "0.18em",
              color: "rgba(224,64,251,0.5)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              // Real-Time Coverage
            </p>
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#e2e8f0",
              margin: 0,
            }}>
              Real-Time{" "}
              <span style={{ color: "#e040fb", textShadow: "0 0 20px rgba(224,64,251,0.3)" }}>
                Threat Detection
              </span>
            </h3>
            <p style={{
              fontSize: 13,
              color: "rgba(226,232,240,0.4)",
              marginTop: 8,
              maxWidth: 480,
              lineHeight: 1.7,
              fontFamily: "'Manrope', sans-serif",
            }}>
              CyberSafe Africa analyses suspicious activity instantly and classifies threats using AI-powered intelligence — protecting people and businesses across Africa.
            </p>
          </div>

          <Link to="/admin/dashboard" style={{
            flexShrink: 0,
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(224,64,251,0.1)",
            border: "1px solid rgba(224,64,251,0.35)",
            color: "#e040fb",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "14px 28px",
            textDecoration: "none",
            transition: "all 0.2s",
            position: "relative",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(224,64,251,0.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(224,64,251,0.1)"; e.currentTarget.style.transform = "none"; }}
          >
            Open Dashboard →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

export default Threats;