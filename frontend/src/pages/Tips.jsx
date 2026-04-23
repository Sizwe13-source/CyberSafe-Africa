import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────── */
const CATEGORIES = {
  Phishing:  { color: "#22d3ee",  label: "PHISHING",  code: "PHI" },
  Scam:      { color: "#e040fb",  label: "SCAM",      code: "SCM" },
  Malware:   { color: "#34d399",  label: "MALWARE",   code: "MLW" },
};

const ALL_FILTERS = ["All", "Phishing", "Scam", "Malware"];

/* ─────────────────────────────────────────
   TIPS DATA
───────────────────────────────────────── */
const TIPS = [
  {
    id: "001",
    category: "Phishing",
    title: "Verify Links Before Clicking",
    description:
      "Always inspect the full URL before clicking. Hover to preview the destination. Avoid links that look suspicious or unfamiliar in unsolicited messages.",
    protocol: "Right-click any link → inspect URL → confirm domain matches the sender's official domain before proceeding.",
    recommended: true,
  },
  {
    id: "002",
    category: "Phishing",
    title: "Check Sender Identity",
    description:
      "Verify the sender's email or contact details before responding to messages requesting sensitive information.",
    protocol: "Check email headers for SPF/DKIM pass status. When in doubt, contact the sender through a separate, verified channel.",
    recommended: false,
  },
  {
    id: "003",
    category: "Scam",
    title: "Avoid Urgent Money Requests",
    description:
      "Be cautious of messages that pressure you to send money quickly. Urgency is a manipulation tactic — always verify before acting.",
    protocol: "Pause 24 hours before any financial transfer requested via message. Call the requester on a known number to confirm.",
    recommended: true,
  },
  {
    id: "004",
    category: "Scam",
    title: "Reject Too-Good-To-Be-True Offers",
    description:
      "If an offer sounds unrealistic or promises extraordinary profit, it is almost certainly a scam designed to exploit optimism.",
    protocol: "Search the offer + 'scam' or 'fraud' online. Check ScamAdvisor or local consumer protection registries.",
    recommended: false,
  },
  {
    id: "005",
    category: "Malware",
    title: "Download Only From Trusted Sources",
    description:
      "Avoid downloading files or applications from unknown sources. Always use official platform stores or verified developer sites.",
    protocol: "Verify file hashes via VirusTotal before execution. Enable Gatekeeper (macOS) or SmartScreen (Windows) at all times.",
    recommended: true,
  },
  {
    id: "006",
    category: "Malware",
    title: "Keep All Software Updated",
    description:
      "Regular updates patch vulnerabilities that attackers actively exploit. Unpatched software is one of the most common attack vectors.",
    protocol: "Enable automatic updates for OS, browsers, and core apps. Review and apply pending patches at least once per week.",
    recommended: false,
  },
];

/* ─────────────────────────────────────────
   TIP CARD
───────────────────────────────────────── */
function TipCard({ tip, index, inView }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORIES[tip.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setExpanded(e => !e)}
      style={{
        background: "rgba(8,14,26,0.7)",
        border: `1px solid rgba(255,255,255,0.06)`,
        borderTop: `2px solid ${cat.color}`,
        padding: "22px 22px 18px",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
      whileHover={{ background: "rgba(255,255,255,0.025)" }}
    >
      {/* ambient glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "50%", height: "50%",
        background: `radial-gradient(circle at 80% 0%, ${cat.color}08, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* category badge */}
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, fontWeight: 500,
            letterSpacing: "0.18em",
            color: cat.color,
            background: `${cat.color}12`,
            border: `1px solid ${cat.color}30`,
            padding: "3px 7px",
            flexShrink: 0,
          }}>
            {cat.code}
          </span>
          {tip.recommended && (
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "#facc15",
              background: "rgba(250,204,21,0.08)",
              border: "1px solid rgba(250,204,21,0.25)",
              padding: "3px 7px",
            }}>
              ★ PRIORITY
            </span>
          )}
        </div>

        {/* index */}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.08em",
          flexShrink: 0,
        }}>
          #{tip.id}
        </span>
      </div>

      {/* title */}
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        color: "#e2e8f0",
        letterSpacing: "-0.01em",
        margin: "0 0 10px",
        lineHeight: 1.3,
      }}>
        {tip.title}
      </h3>

      {/* description */}
      <p style={{
        fontSize: 13,
        color: "rgba(226,232,240,0.45)",
        lineHeight: 1.7,
        margin: 0,
        fontFamily: "'Manrope', sans-serif",
      }}>
        {tip.description}
      </p>

      {/* expand toggle */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 14,
        color: cat.color,
        fontSize: 11,
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.1em",
        opacity: 0.7,
      }}>
        <span style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
        <span>{expanded ? "HIDE PROTOCOL" : "VIEW PROTOCOL"}</span>
      </div>

      {/* protocol panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: `1px solid ${cat.color}20`,
              background: `${cat.color}06`,
              margin: "14px -22px -18px",
              padding: "14px 22px 18px",
            }}>
              <p style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: `${cat.color}80`,
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                // Action Protocol
              </p>
              <p style={{
                fontSize: 12,
                color: "rgba(226,232,240,0.55)",
                lineHeight: 1.7,
                margin: 0,
                fontFamily: "'Manrope', sans-serif",
              }}>
                {tip.protocol}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   TIPS PAGE
───────────────────────────────────────── */
function Tips() {
  const [filter, setFilter] = useState("All");
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, margin: "-60px" });
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const filteredTips = filter === "All"
    ? TIPS
    : TIPS.filter(t => t.category === filter);

  const activeCat = filter !== "All" ? CATEGORIES[filter] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#04080f",
      color: "#e2e8f0",
      fontFamily: "'Manrope', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
      }} />

      {/* ambient glow pools */}
      <div style={{
        position: "fixed", top: "-10%", left: "0%",
        width: "40%", height: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "0%", right: "5%",
        width: "40%", height: "50%",
        background: "radial-gradient(circle, rgba(224,64,251,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 100px", position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, letterSpacing: "0.2em",
                color: "rgba(34,211,238,0.5)",
                textTransform: "uppercase",
              }}>
                // Advisory Protocols
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(34,211,238,0.1)", maxWidth: 100 }} />
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "#e2e8f0",
              margin: "0 0 16px",
            }}>
              CYBERSECURITY{" "}
              <span style={{ color: "#22d3ee", textShadow: "0 0 30px rgba(34,211,238,0.25)" }}>
                SAFETY TIPS
              </span>
            </h1>

            <p style={{
              fontSize: 14,
              color: "rgba(226,232,240,0.38)",
              maxWidth: 500,
              lineHeight: 1.7,
              margin: "0 0 40px",
            }}>
              Practical protocols to protect yourself from common cyber threats.
              Click any card to reveal its action protocol.
            </p>

            {/* ── FILTER BAR ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: 2,
              background: "rgba(8,14,26,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 4,
              width: "fit-content",
              marginBottom: 48,
            }}>
              {ALL_FILTERS.map(f => {
                const cat = f !== "All" ? CATEGORIES[f] : null;
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      padding: "8px 16px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: active
                        ? (cat ? `${cat.color}18` : "rgba(255,255,255,0.06)")
                        : "transparent",
                      color: active
                        ? (cat ? cat.color : "#e2e8f0")
                        : "rgba(255,255,255,0.35)",
                      borderLeft: active && cat ? `2px solid ${cat.color}` : "2px solid transparent",
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                    }}
                  >
                    {f === "All" ? "ALL" : CATEGORIES[f].code}
                    {f !== "All" && (
                      <span style={{ marginLeft: 6, opacity: 0.5, fontSize: 9 }}>
                        ({TIPS.filter(t => t.category === f).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── ACTIVE CATEGORY LABEL ── */}
        <AnimatePresence mode="wait">
          {activeCat && (
            <motion.div
              key={filter}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 20,
              }}
            >
              <div style={{ width: 16, height: 1, background: activeCat.color }} />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, letterSpacing: "0.18em",
                color: activeCat.color, textTransform: "uppercase",
              }}>
                {activeCat.label} protocols — {filteredTips.length} entries
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TIPS GRID ── */}
        <div ref={gridRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
                marginBottom: 64,
              }}
            >
              {filteredTips.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "rgba(255,255,255,0.2)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  border: "1px dashed rgba(255,255,255,0.07)",
                }}>
                  // No protocols available for this category
                </div>
              ) : (
                filteredTips.map((tip, i) => (
                  <TipCard key={tip.id} tip={tip} index={i} inView={inView} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: "36px 40px",
            background: "rgba(8,14,26,0.8)",
            border: "1px solid rgba(34,211,238,0.12)",
            borderLeft: "3px solid #22d3ee",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div style={{
            position: "absolute", top: "-40%", right: "-5%",
            width: "30%", height: "200%",
            background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: "0.18em",
              color: "rgba(34,211,238,0.5)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              // Live Threat Monitoring
            </p>
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#e2e8f0",
              margin: "0 0 8px",
            }}>
              Monitor Threats in{" "}
              <span style={{ color: "#22d3ee", textShadow: "0 0 20px rgba(34,211,238,0.25)" }}>
                Real-Time
              </span>
            </h3>
            <p style={{
              fontSize: 13,
              color: "rgba(226,232,240,0.38)",
              maxWidth: 420,
              lineHeight: 1.7,
              margin: 0,
            }}>
              Use the dashboard to track detected threats and gain AI-powered intelligence in real time.
            </p>
          </div>

          <Link
            to="/dashboard"
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#22d3ee",
              color: "#000",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "14px 28px",
              textDecoration: "none",
              transition: "all 0.2s",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#67e8f9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#22d3ee"; e.currentTarget.style.transform = "none"; }}
          >
            Open Dashboard →
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

export default Tips;
