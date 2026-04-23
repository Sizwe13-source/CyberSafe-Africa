import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   NAV LINKS CONFIG
───────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",               path: "/",                code: "01" },
  { label: "Threat Intelligence",path: "/threats",         code: "02" },
  { label: "Safety Protocols",   path: "/tips",            code: "03" },
  { label: "Dashboard",          path: "/admin/dashboard", code: "04", highlight: true },
];

/* ─────────────────────────────────────────
   LIVE CLOCK
───────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      color: "rgba(34,211,238,0.5)",
      letterSpacing: "0.1em",
      userSelect: "none",
    }}>
      {time}
    </span>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  /* scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* close mobile on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Manrope:wght@500;600&display=swap');
        @keyframes nav-blip { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
        @keyframes nav-scan { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>

      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled
          ? "rgba(4,8,15,0.96)"
          : "rgba(4,8,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(34,211,238,0.08)",
        boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.4)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
        fontFamily: "'Manrope', sans-serif",
      }}>

        {/* scan-line shimmer on scroll */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 50%, transparent 100%)",
          overflow: "hidden",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.8), transparent)",
            animation: "nav-scan 3s ease-in-out infinite",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 0.4s",
          }} />
        </div>

        <nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

          {/* ── MAIN BAR ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
            gap: 16,
          }}>

            {/* ── LOGO ── */}
            <Link to="/" style={{
              display: "flex", alignItems: "center", gap: 12,
              textDecoration: "none", flexShrink: 0,
            }}>
              {/* shield icon */}
              <div style={{
                width: 36, height: 36,
                border: "1px solid rgba(34,211,238,0.3)",
                background: "rgba(34,211,238,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.6)";
                  e.currentTarget.style.background = "rgba(34,211,238,0.12)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(34,211,238,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)";
                  e.currentTarget.style.background = "rgba(34,211,238,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" style={{ width: 18, height: 18 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#e2e8f0",
                  lineHeight: 1.1,
                }}>
                  CyberSafe{" "}
                  <span style={{ color: "#22d3ee" }}>Africa</span>
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  marginTop: 1,
                }}>
                  AI Threat Monitoring
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              flex: 1,
              justifyContent: "center",
            }}
              className="desktop-nav"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.path);
                if (link.highlight) return null; // rendered separately
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      position: "relative",
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 18px",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? "#22d3ee" : "rgba(226,232,240,0.5)",
                      transition: "color 0.15s",
                      borderBottom: active ? "1px solid #22d3ee" : "1px solid transparent",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.color = "rgba(226,232,240,0.85)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.color = "rgba(226,232,240,0.5)";
                    }}
                  >
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: active ? "rgba(34,211,238,0.6)" : "rgba(255,255,255,0.2)",
                      letterSpacing: "0.1em",
                    }}>
                      {link.code}
                    </span>
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active-dot"
                        style={{
                          position: "absolute", bottom: -5,
                          left: "50%", transform: "translateX(-50%)",
                          width: 4, height: 4, borderRadius: "50%",
                          background: "#22d3ee",
                          boxShadow: "0 0 8px #22d3ee",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── RIGHT CLUSTER ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

              {/* live status */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "5px 10px",
                border: "1px solid rgba(52,211,153,0.2)",
                background: "rgba(52,211,153,0.04)",
              }}
                className="live-status"
              >
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 6px #34d399",
                  display: "inline-block",
                  animation: "nav-blip 1.4s ease-in-out infinite",
                }} />
                <LiveClock />
              </div>

              {/* Dashboard CTA */}
              <Link
                to="/admin/dashboard"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: isActive("/admin/dashboard") ? "#22d3ee" : "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.35)",
                  color: isActive("/admin/dashboard") ? "#000" : "#22d3ee",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  flexShrink: 0,
                }}
                className="dashboard-cta"
                onMouseEnter={e => {
                  if (!isActive("/admin/dashboard")) {
                    e.currentTarget.style.background = "rgba(34,211,238,0.15)";
                    e.currentTarget.style.boxShadow = "0 0 16px rgba(34,211,238,0.12)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive("/admin/dashboard")) {
                    e.currentTarget.style.background = "rgba(34,211,238,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10 }}>
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
                Dashboard
              </Link>

              {/* mobile hamburger */}
              <button
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle navigation"
                style={{
                  display: "none",
                  alignItems: "center", justifyContent: "center",
                  width: 36, height: 36,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  padding: 0,
                  flexShrink: 0,
                }}
                className="mobile-toggle"
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"; e.currentTarget.style.color = "#22d3ee"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                {open ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}>
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}>
                    <path d="M3 6h18M3 12h12M3 18h18" strokeLinecap="round" />
                  </svg>
                )}
              </button>

            </div>
          </div>

          {/* ── MOBILE MENU ── */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  padding: "12px 0 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}>
                  {/* status row */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "6px 12px 12px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    marginBottom: 8,
                  }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9, letterSpacing: "0.18em",
                      color: "rgba(34,211,238,0.4)",
                      textTransform: "uppercase",
                    }}>
                      // Navigation
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                      <LiveClock />
                    </div>
                  </div>

                  {NAV_LINKS.map((link, i) => {
                    const active = isActive(link.path);
                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <Link
                          to={link.path}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "11px 12px",
                            textDecoration: "none",
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                            color: active ? "#22d3ee" : "rgba(226,232,240,0.55)",
                            background: active ? "rgba(34,211,238,0.06)" : "transparent",
                            borderLeft: active ? "2px solid #22d3ee" : "2px solid transparent",
                            transition: "all 0.15s",
                            fontFamily: "'Manrope', sans-serif",
                          }}
                        >
                          <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 9,
                            color: active ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.2)",
                            letterSpacing: "0.1em",
                            width: 16,
                            flexShrink: 0,
                          }}>
                            {link.code}
                          </span>
                          {link.label}
                          {link.highlight && (
                            <span style={{
                              marginLeft: "auto",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 8, letterSpacing: "0.15em",
                              color: "#22d3ee",
                              background: "rgba(34,211,238,0.1)",
                              border: "1px solid rgba(34,211,238,0.25)",
                              padding: "2px 6px",
                            }}>
                              LIVE
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>

        {/* responsive rules */}
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .live-status  { display: none !important; }
            .dashboard-cta { display: none !important; }
            .mobile-toggle { display: flex !important; }
          }
        `}</style>

      </header>
    </>
  );
}

export default Navbar;
