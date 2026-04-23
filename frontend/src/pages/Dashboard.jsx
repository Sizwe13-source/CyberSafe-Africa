import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import SimpleChart from "../components/SimpleChart";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

/* ─────────────────────────────────────────
   SEVERITY CONFIG
───────────────────────────────────────── */
const SEVERITY = {
  critical: { min: 90, label: "Critical", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
  high:     { min: 75, label: "High",     color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.25)" },
  medium:   { min: 50, label: "Medium",   color: "#facc15", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.25)" },
  low:      { min: 0,  label: "Low",      color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)" },
};

const getSeverity = (confidence = 0) => {
  if (confidence >= 90) return SEVERITY.critical;
  if (confidence >= 75) return SEVERITY.high;
  if (confidence >= 50) return SEVERITY.medium;
  return SEVERITY.low;
};

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

/* ─────────────────────────────────────────
   PULSE DOT
───────────────────────────────────────── */
function LiveDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "#34d399", animation: "ping 1.4s ease-in-out infinite",
      }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "block" }} />
      <style>{`@keyframes ping{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:0;transform:scale(2.2)}}`}</style>
    </span>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ title, value, icon, accent = "#6366f1", trend }) {
  return (
    <motion.div variants={fadeUp} style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(12px)",
    }}>
      {/* accent glow */}
      <div style={{
        position: "absolute", top: -30, right: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: accent, opacity: 0.06, filter: "blur(24px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
            {title}
          </p>
          <p style={{ fontSize: 28, fontWeight: 600, color: "#f1f5f9", margin: "6px 0 0", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>
            {value ?? "—"}
          </p>
          {trend && (
            <p style={{ fontSize: 12, color: trend > 0 ? "#34d399" : "#f87171", margin: "4px 0 0" }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last hour
            </p>
          )}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   ALERT BANNER
───────────────────────────────────────── */
function AlertBanner({ alert, onDismiss }) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert._id || alert.message}
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderLeft: "3px solid #ef4444",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#f87171", fontWeight: 600 }}>🚨</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5" }}>{alert.threatType}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>{alert.message}</span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
          >✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   INSIGHT CARD
───────────────────────────────────────── */
function InsightCard({ insight, index }) {
  const sev = getSeverity(insight.confidence);
  return (
    <motion.div
      variants={fadeUp}
      style={{
        padding: "14px 16px",
        background: sev.bg,
        border: `1px solid ${sev.border}`,
        borderRadius: 12,
        marginBottom: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: sev.color, background: `${sev.color}18`,
              border: `1px solid ${sev.color}35`,
              padding: "2px 7px", borderRadius: 5, textTransform: "uppercase",
            }}>
              {sev.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {insight.threatType}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 8px", lineHeight: 1.5 }}>
            {insight.explanation}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.4 }}>
            <span style={{ color: sev.color, marginRight: 4 }}>›</span>
            {insight.recommendation}
          </p>
        </div>

        {/* Confidence ring */}
        <div style={{ marginLeft: 16, flexShrink: 0, position: "relative", width: 44, height: 44 }}>
          <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
            <circle
              cx={22} cy={22} r={18} fill="none"
              stroke={sev.color} strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - insight.confidence / 100)}`}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <span style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: sev.color, fontFamily: "'DM Mono', monospace",
          }}>
            {insight.confidence}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   INCIDENT ROW
───────────────────────────────────────── */
function IncidentRow({ incident }) {
  const sev = getSeverity(incident.confidence);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      onClick={() => setExpanded(e => !e)}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `2px solid ${sev.color}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      whileHover={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: sev.color, flexShrink: 0,
            boxShadow: `0 0 6px ${sev.color}`,
          }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {incident.threatType}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {incident.description}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: sev.color, fontFamily: "'DM Mono', monospace",
          }}>
            {incident.confidence}%
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
            color: sev.color, background: `${sev.color}15`,
            border: `1px solid ${sev.color}30`,
            padding: "2px 7px", borderRadius: 4, textTransform: "uppercase",
          }}>
            {sev.label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            ▾
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
                <span style={{ color: "rgba(255,255,255,0.25)", marginRight: 6 }}>Detection</span>
                {incident.reason || "AI-driven behavioural analysis"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState({ totalReports: 0, mostCommonThreat: "" });
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const shownToastIds = useRef(new Set());

  const buildChartData = useCallback((data) => {
    const map = {};
    data.forEach((i) => {
      const type = i.threatType || "Other";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const fetchAIInsights = useCallback(async () => {
    try {
      setLoadingAI(true);
      const res = await api.get("/ai/insights");
      setAiInsights(res.data.insights || []);
    } catch {
      setAiInsights([{
        threatType: "System",
        confidence: 0,
        explanation: "AI analysis unavailable — check backend connection.",
        recommendation: "Verify the /ai/insights endpoint is reachable."
      }]);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, incidentsRes, alertsRes] = await Promise.all([
        api.get("/incidents/dashboard"),
        api.get("/incidents"),
        api.get("/incidents/alerts"),
      ]);

      const data = incidentsRes.data.data || [];
      setStats(statsRes.data || {});
      setIncidents(data);
      setAlerts(alertsRes.data.data || []);
      setChartData(buildChartData(data));
      setLastUpdated(new Date());
      fetchAIInsights();
    } catch {
      toast.error("Failed to load dashboard data");
    }
  }, [buildChartData, fetchAIInsights]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const socket = io("http://localhost:5001");

    socket.on("new-threat", (newIncident) => {
      setIncidents((prev) => {
        const updated = [newIncident, ...prev];
        setChartData(buildChartData(updated));
        fetchAIInsights();
        return updated;
      });

      setStats((prev) => ({ ...prev, totalReports: prev.totalReports + 1 }));
      setLastUpdated(new Date());

      if (!shownToastIds.current.has(newIncident._id)) {
        toast.error(`${newIncident.threatType} detected`, {
          style: {
            background: "#0f172a",
            color: "#f87171",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 10,
            fontSize: 13,
          },
        });
        shownToastIds.current.add(newIncident._id);
      }
    });

    return () => socket.disconnect();
  }, [buildChartData, fetchAIInsights]);

  const topAlert = !dismissedAlert ? alerts[0] : null;
  const criticalCount = incidents.filter(i => (i.confidence || 0) >= 90).length;
  const highCount = incidents.filter(i => (i.confidence || 0) >= 75 && (i.confidence || 0) < 90).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030712",
      color: "#f1f5f9",
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      padding: "28px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── HEADER ── */}
          <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <LiveDot />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#34d399", textTransform: "uppercase" }}>
                  Live monitoring
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Threat Intelligence
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                AI-powered cyber threat detection & analysis
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {lastUpdated && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
                  Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <button
                onClick={fetchData}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "7px 14px",
                  color: "rgba(255,255,255,0.6)", fontSize: 13,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >
                ↻ Refresh
              </button>
            </div>
          </motion.div>

          {/* ── ALERT BANNER ── */}
          <AlertBanner alert={topAlert} onDismiss={() => setDismissedAlert(true)} />

          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <StatCard title="Total Threats" value={stats.totalReports} icon="🛡" accent="#6366f1" />
            <StatCard title="Most Common" value={stats.mostCommonThreat || "—"} icon="📊" accent="#8b5cf6" />
            <StatCard title="Active Incidents" value={incidents.length} icon="⚡" accent="#06b6d4" />
            <StatCard title="Critical" value={criticalCount} icon="🚨" accent="#ef4444" />
            <StatCard title="High Severity" value={highCount} icon="⚠" accent="#fb923c" />
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* AI Insights */}
            <motion.div variants={fadeUp} style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px 20px 14px",
              minHeight: 340,
              overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  }}>🧠</div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                    AI Intelligence
                  </h2>
                </div>
                {loadingAI && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", animation: "pulse 1s infinite" }}>
                    Analysing…
                  </span>
                )}
              </div>
              <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>

              <motion.div variants={stagger} initial="hidden" animate="show">
                {!loadingAI && aiInsights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
                {loadingAI && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{
                    height: 72, borderRadius: 12, marginBottom: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    animation: "pulse 1.2s ease-in-out infinite",
                  }} />
                ))}
              </motion.div>
            </motion.div>

            {/* Chart */}
            <motion.div variants={fadeUp} style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px",
              minHeight: 340,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(6,182,212,0.15)",
                  border: "1px solid rgba(6,182,212,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                }}>📈</div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  Threat Distribution
                </h2>
              </div>
              <div style={{ flex: 1 }}>
                <SimpleChart data={chartData} />
              </div>
            </motion.div>
          </div>

          {/* ── INCIDENTS ── */}
          <motion.div variants={fadeUp}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                }}>🗂</div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  Recent Activity
                </h2>
              </div>
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Mono', monospace",
              }}>
                {incidents.length} events
              </span>
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {incidents.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                  color: "rgba(255,255,255,0.2)", fontSize: 14,
                  border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 12,
                }}>
                  No incidents recorded yet
                </div>
              )}
              {incidents.map((incident) => (
                <IncidentRow key={incident._id} incident={incident} />
              ))}
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
