// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";

import Home       from "./pages/Home";
import Threats    from "./pages/Threats";
import Tips       from "./pages/Tips";
import Dashboard  from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { Toaster } from "react-hot-toast";
import api from "./services/api";

// Leaflet icon fix
import "leaflet/dist/leaflet.css";
import L from "leaflet";

if (L?.Icon?.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

/** Send real user activity to backend for threat analysis */
const reportActivity = (payload) => {
  api.post("/activity", payload).catch(() => {});
};

/** Returns true if the link points to our own site — skip those */
const isInternalLink = (href) => {
  try {
    return new URL(href).origin === window.location.origin;
  } catch {
    return true;
  }
};

/** Wait until the user stops typing before scanning */
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
function App() {

  /* ── Real URL detection: fires when a user clicks any external link ── */
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest("a");
      if (!link?.href) return;
      if (isInternalLink(link.href)) return;

      reportActivity({ type: "url", url: link.href });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ── Real text detection: fires when a user types in any input field ── */
  useEffect(() => {
    const handleInput = debounce((e) => {
      const value = e.target?.value?.trim();
      if (!value || value.length < 10) return;
      if (e.target.type === "password") return; // never scan passwords

      reportActivity({ type: "text", text: value });
    }, 600);

    document.addEventListener("input", handleInput);
    return () => document.removeEventListener("input", handleInput);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090e20] text-white">

      <Navbar />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <main className="flex-1">
        <Routes>

          {/* Public */}
          <Route path="/"        element={<Home />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/tips"    element={<Tips />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin"     element={<Navigate to="/admin/login" />} />
          <Route path="/app"       element={<Navigate to="/admin/dashboard" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
