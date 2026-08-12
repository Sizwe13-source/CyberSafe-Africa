// src/context/AuthContext.jsx
// Unified auth around admin JWT (matches backend /api/admin/*).

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

function readStoredAdmin() {
  try {
    const token = localStorage.getItem("adminToken");
    const raw = localStorage.getItem("adminUser");
    if (!token || !raw) return null;
    const admin = JSON.parse(raw);
    return { ...admin, token };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(() => {
    const stored = readStoredAdmin();
    setUser(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    hydrate();
    const onStorage = (e) => {
      if (e.key === "adminToken" || e.key === "adminUser") hydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrate]);

  const login = async (email, password) => {
    const { data } = await api.post("/admin/login", { email, password });
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
    const next = { ...data.admin, token: data.token };
    setUser(next);
    return data;
  };

  const logout = async () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: hydrate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
