//components/Footer.jsx
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#090e20] to-[#0F0F1E] border-t border-cyan-400/20">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 py-16">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-400/10 p-2 rounded border border-cyan-400/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
              </div>

              <span className="font-heading text-xl font-bold">
                CyberSafe <span className="text-cyan-400">Africa</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Protecting people and businesses from cyber threats through education, awareness, and incident reporting.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-cyan-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/threats" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                  Common Threats
                </Link>
              </li>
              <li>
                <Link to="/tips" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-fuchsia-500">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/report" className="text-sm text-slate-400 hover:text-fuchsia-500 transition">
                  Report Incident
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-fuchsia-500 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-fuchsia-500 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-fuchsia-500 transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-cyan-400">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-slate-400">

              <li className="flex gap-3">
                <span className="text-cyan-400">✉</span>
                support@cybersafeafrica.org
              </li>

              <li className="flex gap-3">
                <span className="text-cyan-400">📞</span>
                +27 64 671 4715
              </li>

              <li className="flex gap-3">
                <span className="text-cyan-400">📍</span>
                South Africa
              </li>

            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-8 border-t border-cyan-400/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-sm text-slate-400">
              © 2026 CyberSafe Africa. All rights reserved.
            </p>

            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                Privacy Policy
              </a>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;