// src/pages/Login.jsx
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/dashboard";

  useEffect(() => {
    navigate("/admin/login", { replace: true, state: { from } });
  }, [navigate, from]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm text-white/60">Redirecting to admin login…</p>
      <Link to="/admin/login" state={{ from }} className="mt-4 text-cyan-400 hover:underline text-sm">
        Continue to Admin Login
      </Link>
    </div>
  );
}
