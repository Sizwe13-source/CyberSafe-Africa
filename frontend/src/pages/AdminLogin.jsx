//pages/AdminLogin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 AUTO-REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 BASIC VALIDATION
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/admin/login", formData);

      // 🔥 SAVE ADMIN DATA
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.admin));

      // 🔥 SUCCESS FEEDBACK
      toast.success("✅ Admin login successful");

      // 🔥 REDIRECT
      navigate("/dashboard");

    } catch (err) {
      const message =
        err.response?.data?.message || "Admin login failed.";

      setError(message);
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e20] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-fuchsia-500/20 bg-[#11111E] p-8 shadow-lg">

        {/* HEADER */}
        <h1 className="text-3xl mb-2 font-bold">
          Admin <span className="text-fuchsia-500">Access</span>
        </h1>

        <p className="text-slate-400 mb-6 text-sm">
          Secure login to access the threat intelligence dashboard.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            name="email"
            placeholder="Admin email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border border-fuchsia-500/20 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border border-fuchsia-500/20 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-fuchsia-500 py-3 font-semibold text-black transition hover:bg-fuchsia-400 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Admin Login"}
          </button>

        </form>

        {/* 🔥 DEMO SHORTCUT (OPTIONAL) */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 w-full text-sm text-cyan-400 hover:underline"
        >
          Skip login (Demo Mode)
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;