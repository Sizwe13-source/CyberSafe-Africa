import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Threats from "./pages/Threats";
import Tips from "./pages/Tips";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { Toaster } from "react-hot-toast";

// 🔥 Leaflet Fix
import "leaflet/dist/leaflet.css";
import L from "leaflet";

if (L?.Icon?.Default) {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

function App() {

  // 🔥 AUTO DETECT URL CLICKS
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest("a");

      if (link && link.href) {
        fetch("http://localhost:5001/api/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "url",
            url: link.href,
          }),
        });
      }
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 🔥 AUTO DETECT TEXT INPUT
  useEffect(() => {
    const handleInput = (e) => {
      const value = e.target.value;

      if (!value || value.length < 10) return;

      fetch("http://localhost:5001/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "text",
          text: value,
        }),
      });
    };

    document.addEventListener("change", handleInput);

    return () => document.removeEventListener("change", handleInput);
  }, []);

  useEffect(() => {
    const simulatedActivities = [
      {
        type: "text",
        text: "Verify your account immediately to avoid suspension"
      },
      {
        type: "text",
        text: "Send OTP urgently to receive funds"
      },
      {
        type: "url",
        url: "http://secure-login-verification-alert.com"
      },
      {
        type: "text",
        text: "You have won a lottery, claim your prize now"
      }
    ];

    const runSimulation = () => {
      // 🔥 50% chance to DO NOTHING (realistic)
      if (Math.random() < 0.5) return;

      const activity =
        simulatedActivities[
          Math.floor(Math.random() * simulatedActivities.length)
        ];

      fetch(`${import.meta.env.VITE_API_URL}/api/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activity.type,
          text: activity.text || "",
          url: activity.url || "",
        }),
      });
    };

    // 🔥 RANDOM INTERVAL (5–15 sec)
    const interval = setInterval(runSimulation, 5000 + Math.random() * 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090e20] text-white">

      <Navbar />

      {/* 🔥 TOAST SYSTEM */}
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

          {/* 🏠 PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/tips" element={<Tips />} />

          {/* 🔐 ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          {/* 🔁 REDIRECTS */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin" element={<Navigate to="/admin/login" />} />
          <Route path="/app" element={<Navigate to="/admin/dashboard" />} />

          {/* ❌ FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;