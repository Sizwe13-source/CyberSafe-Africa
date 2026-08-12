// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ScamAlertBanner from "./components/scamAlert";
import FAQ from "./components/Faq";
import ScamChecker from "./components/scamchecker";
import PasswordChecker from "./components/Passwordchecker";
import ConsentBanner from "./components/ConsentBanner";
import ChatAssistant from "./components/ChatAssistant";

import Home from "./pages/Home";
import Threats from "./pages/Threats";
import Tips from "./pages/Tips";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import ConnectionChecker from "./pages/Connectionchecker";
import IncidentReport from "./pages/IncidentReport";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

if (L?.Icon?.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

// Keep your existing activity reporting helpers
const reportActivity = (payload) => {
  import("./services/api").then(({ default: api }) => {
    api.post("/activity", payload).catch(() => {});
  });
};

const isInternalLink = (href) => {
  try { return new URL(href).origin === window.location.origin; }
  catch { return true; }
};

const debounce = (fn, ms) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
};

function App() {
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest("a");
      if (!link?.href || isInternalLink(link.href)) return;
      reportActivity({ type: "url", url: link.href });
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleInput = debounce((e) => {
      const value = e.target?.value?.trim();
      if (!value || value.length < 10) return;
      if (e.target.type === "password") return;
      reportActivity({ type: "text", text: value });
    }, 600);
    document.addEventListener("input", handleInput);
    return () => document.removeEventListener("input", handleInput);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#090e20] text-white">
        <ScamAlertBanner />
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
            <Route path="/" element={<Home />} />
            <Route path="/threats" element={<Threats />} />
            <Route path="/tips" element={<Tips />} />
            <Route
              path="/dashboard"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/scam-checker" element={<ScamChecker />} />
            <Route path="/password-checker" element={<PasswordChecker />} />
            <Route path="/connection-checker" element={<ConnectionChecker />} />
            <Route path="/incident-report" element={<IncidentReport />} />
            <Route path="/report" element={<Navigate to="/incident-report" replace />} />
            <Route path="/about" element={<Navigate to="/faq" replace />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ConsentBanner />
        <Footer />
        <ChatAssistant />
      </div>
    </AuthProvider>
  );
}

export default App;