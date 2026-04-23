import axios from "axios";

// 🌐 BASE URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// 🔧 CREATE INSTANCE
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // future-proof (cookies if needed)
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔥 UNAUTHORIZED → LOGOUT
    if (status === 401) {
      console.warn("⚠️ Unauthorized - logging out");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      window.location.href = "/admin/login";
    }

    // 🔥 SERVER ERROR
    if (status >= 500) {
      console.error("🔥 Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;