import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Threats from "./Threats";

/* ─────────────────────────────────────────
   FONTS & GLOBALS
───────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --c-bg:      #04080f;
    --c-surface: #080e1a;
    --c-border:  rgba(255,255,255,0.07);
    --c-cyan:    #22d3ee;
    --c-magenta: #e040fb;
    --c-text:    #e2e8f0;
    --c-muted:   rgba(226,232,240,0.4);
    --font-display: 'Syne', sans-serif;
    --font-mono:    'DM Mono', monospace;
    --font-body:    'Manrope', sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--c-bg); font-family: var(--font-body); }

  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes orbit-cw  { to { transform: rotate(360deg); } }
  @keyframes orbit-ccw { to { transform: rotate(-360deg); } }
  @keyframes orbit-mid { to { transform: rotate(360deg); } }
  @keyframes blip {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.5); }
  }
  @keyframes counter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes hbar { from { width: 0; } to { width: var(--w); } }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  @keyframes glitch-h {
    0%,96%  { clip-path: none; transform: none; }
    97%     { clip-path: polygon(0 10%,100% 10%,100% 25%,0 25%); transform: translateX(-3px); }
    98%     { clip-path: polygon(0 55%,100% 55%,100% 72%,0 72%); transform: translateX(3px); }
    99%     { clip-path: polygon(0 30%,100% 30%,100% 45%,0 45%); transform: translateX(-1px); }
    100%    { clip-path: none; transform: none; }
  }
`;

/* ─────────────────────────────────────────
   RADAR VISUAL
───────────────────────────────────────── */
function RadarOrb() {
  const blips = [
    { r: 38, angle: 42,  size: 5, color: "#ef4444" },
    { r: 62, angle: 135, size: 4, color: "#22d3ee" },
    { r: 51, angle: 220, size: 6, color: "#e040fb" },
    { r: 72, angle: 310, size: 4, color: "#facc15" },
    { r: 28, angle: 280, size: 3, color: "#22d3ee" },
    { r: 83, angle: 75,  size: 4, color: "#ef4444" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, aspectRatio: "1", margin: "0 auto" }}>

      {/* rings */}
      {[1, 0.73, 0.47, 0.25].map((scale, i) => (
        <div key={i} style={{
          position: "absolute",
          inset: `${(1 - scale) * 50}%`,
          borderRadius: "50%",
          border: `1px solid rgba(34,211,238,${0.06 + i * 0.04})`,
        }} />
      ))}

      {/* crosshairs */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(34,211,238,0.07)" }} />
        <div style={{ position: "absolute", height: "100%", width: 1, background: "rgba(34,211,238,0.07)" }} />
      </div>

      {/* sweeping orbit */}
      <div style={{
        position: "absolute", inset: "8%",
        borderRadius: "50%",
        border: "1.5px solid transparent",
        borderTopColor: "rgba(34,211,238,0.45)",
        borderRightColor: "rgba(34,211,238,0.15)",
        animation: "orbit-cw 5s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: "22%",
        borderRadius: "50%",
        border: "1px solid transparent",
        borderBottomColor: "rgba(224,64,251,0.35)",
        borderLeftColor: "rgba(224,64,251,0.12)",
        animation: "orbit-ccw 9s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: "36%",
        borderRadius: "50%",
        border: "1px solid transparent",
        borderTopColor: "rgba(34,211,238,0.25)",
        animation: "orbit-mid 13s linear infinite",
      }} />

      {/* blips */}
      {blips.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const pct = b.r / 2; // % from center
        return (
          <div key={i} style={{
            position: "absolute",
            left: `calc(50% + ${Math.cos(rad) * pct}% - ${b.size / 2}px)`,
            top:  `calc(50% + ${Math.sin(rad) * pct}% - ${b.size / 2}px)`,
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: b.color,
            boxShadow: `0 0 8px ${b.color}`,
            animation: `blip ${1.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.25}s`,
          }} />
        );
      })}

      {/* center core */}
      <div style={{
        position: "absolute", inset: "43%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)",
        border: "1px solid rgba(34,211,238,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(9px, 1.2vw, 13px)",
          fontWeight: 700,
          color: "var(--c-cyan)",
          letterSpacing: "0.06em",
          textAlign: "center",
          lineHeight: 1.3,
        }}>
          CYBER<br />SAFE
        </span>
      </div>

      {/* floating data chips */}
      <DataChip
        style={{ top: "8%", left: "-5%" }}
        label="Detection"
        value="AI-Powered"
        color="var(--c-cyan)"
      />
      <DataChip
        style={{ bottom: "12%", right: "-4%" }}
        label="Status"
        value="LIVE"
        color="var(--c-magenta)"
        pulse
      />
      <DataChip
        style={{ bottom: "30%", left: "-8%" }}
        label="Threats blocked"
        value="Real-time"
        color="#facc15"
      />
    </div>
  );
}

function DataChip({ label, value, color, pulse, style }) {
  return (
    <div style={{
      position: "absolute",
      background: "rgba(8,14,26,0.9)",
      border: `1px solid ${color}35`,
      borderLeft: `2px solid ${color}`,
      padding: "8px 12px",
      backdropFilter: "blur(8px)",
      ...style,
    }}>
      <p style={{ fontSize: 10, color: "var(--c-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
        {pulse && (
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
            display: "inline-block",
            animation: "blip 1.2s ease-in-out infinite",
          }} />
        )}
        <p style={{
          fontSize: 13, fontWeight: 600,
          color, fontFamily: "var(--font-mono)",
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TICKER STRIP
───────────────────────────────────────── */
const TICKER_ITEMS = [
  { label: "Phishing", delta: "+12%", up: true },
  { label: "Ransomware", delta: "+7%", up: true },
  { label: "DDoS", delta: "-3%", up: false },
  { label: "SQLi", delta: "+5%", up: true },
  { label: "Credential Stuffing", delta: "+19%", up: true },
  { label: "Man-in-the-Middle", delta: "-8%", up: false },
  { label: "Zero-Day Exploits", delta: "+2%", up: true },
];

function TickerStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      borderTop: "1px solid var(--c-border)",
      borderBottom: "1px solid var(--c-border)",
      background: "rgba(8,14,26,0.9)",
      overflow: "hidden",
      padding: "10px 0",
      position: "relative",
    }}>
      <div style={{
        display: "flex", gap: 48,
        animation: "orbit-cw 30s linear infinite",
        width: "max-content",
        whiteSpace: "nowrap",
      }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--c-muted)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "rgba(34,211,238,0.3)" }}>◆</span>
            <span style={{ letterSpacing: "0.05em" }}>{item.label}</span>
            <span style={{ color: item.up ? "#34d399" : "#f87171", fontWeight: 500 }}>
              {item.up ? "▲" : "▼"} {item.delta}
            </span>
          </span>
        ))}
      </div>
      {/* fade edges */}
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 60, background: "linear-gradient(to right, rgba(8,14,26,1), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: "0 0 0 auto", width: 60, background: "linear-gradient(to left, rgba(8,14,26,1), transparent)", pointerEvents: "none" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT BAR
───────────────────────────────────────── */
function StatBar({ label, pct, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--c-muted)", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color, fontWeight: 500 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          borderRadius: 2,
          "--w": `${pct}%`,
          width: inView ? `${pct}%` : "0%",
          transition: inView ? "width 1.2s cubic-bezier(0.16,1,0.3,1)" : "none",
          transitionDelay: "0.2s",
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };
  const stagger = { show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-text)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Scan-line atmosphere */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0,
        }}>
          {/* grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
          }} />
          {/* ambient glow pools */}
          <div style={{
            position: "absolute", top: "-10%", left: "5%",
            width: "40%", height: "60%", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "0%", right: "10%",
            width: "45%", height: "55%", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(224,64,251,0.07) 0%, transparent 70%)",
          }} />
          {/* moving scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)",
            animation: "scanline 8s linear infinite",
            opacity: 0.6,
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 1280, margin: "0 auto",
          padding: "clamp(60px, 10vh, 120px) 24px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
          flex: 1,
        }}
          className="hero-grid"
        >
          {/* ── LEFT ── */}
          <motion.div variants={stagger} initial="hidden" animate={mounted ? "show" : "hidden"}>

            <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: "#34d399", boxShadow: "0 0 8px #34d399",
                animation: "blip 1.2s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11, fontWeight: 500,
                color: "var(--c-cyan)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                border: "1px solid rgba(34,211,238,0.2)",
                padding: "4px 10px",
              }}>
                AI Threat Monitoring Active
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              animation: "glitch-h 7s steps(1) infinite",
            }}>
              <span style={{ display: "block", color: "#e2e8f0" }}>PROTECT</span>
              <span style={{ display: "block", color: "rgba(226,232,240,0.55)" }}>PEOPLE &</span>
              <span style={{ display: "block", color: "var(--c-cyan)", textShadow: "0 0 40px rgba(34,211,238,0.3)" }}>
                BUSINESSES
              </span>
            </motion.h1>

            <motion.div variants={fadeUp} style={{
              borderLeft: "2px solid var(--c-magenta)",
              paddingLeft: 16,
              marginBottom: 36,
              maxWidth: 480,
            }}>
              <p style={{
                fontSize: "clamp(14px, 1.5vw, 17px)",
                lineHeight: 1.7,
                color: "rgba(226,232,240,0.5)",
              }}>
                CyberSafe Africa uses AI to detect cyber threats, analyze suspicious activity, and provide real-time intelligence across digital platforms.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
              <Link to="/admin/dashboard" style={{
                position: "relative",
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--c-magenta)",
                color: "#000",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "14px 28px",
                textDecoration: "none",
                transition: "all 0.2s",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ea4cfc"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--c-magenta)"; e.currentTarget.style.transform = "none"; }}
              >
                ⬡ Launch Dashboard
              </Link>

              <a href="#threats" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(34,211,238,0.35)",
                color: "var(--c-cyan)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "14px 28px",
                textDecoration: "none",
                transition: "all 0.2s",
                background: "rgba(34,211,238,0.04)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,211,238,0.04)"; e.currentTarget.style.transform = "none"; }}
              >
                Explore Threats →
              </a>
            </motion.div>

            {/* Threat breakdown bars */}
            <motion.div variants={fadeUp} style={{
              background: "rgba(8,14,26,0.8)",
              border: "1px solid var(--c-border)",
              padding: "18px 20px",
              maxWidth: 420,
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(34,211,238,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>
                // Threat Activity Index
              </p>
              <StatBar label="PHISHING"            pct={84} color="#ef4444" />
              <StatBar label="RANSOMWARE"          pct={61} color="#e040fb" />
              <StatBar label="CREDENTIAL ATTACKS"  pct={47} color="#facc15" />
              <StatBar label="ZERO-DAY"            pct={28} color="#22d3ee" />
            </motion.div>

          </motion.div>

          {/* ── RIGHT ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RadarOrb />
          </motion.div>

        </div>

        {/* Ticker */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <TickerStrip />
        </div>

      </section>

      {/* ── THREATS SECTION ── */}
      <div id="threats" style={{ position: "relative" }}>
        {/* section divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.2), rgba(224,64,251,0.2), transparent)",
          margin: "0",
        }} />
        <Threats />
      </div>

      {/* responsive stacking */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
