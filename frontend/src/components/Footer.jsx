// components/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
} from "react-icons/fi";
import ContactModal from "./ContactModal";

function Footer() {
  const year = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="w-full bg-gradient-to-b from-[#090e20] to-[#0F0F1E] border-t border-cyan-400/20">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 py-16">
        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-400/10 p-2 rounded border border-cyan-400/30">
                <FiShield className="w-6 h-6 text-cyan-400" />
              </div>

              <span className="font-heading text-xl font-bold text-white">
                CyberSafe <span className="text-cyan-400">Africa</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Protecting people and businesses from cyber threats through
              education, awareness, and incident reporting.
            </p>

            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="w-9 h-9 flex items-center justify-center rounded border border-cyan-400/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition"
              >
                <FiTwitter className="w-4 h-4" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on LinkedIn"
                className="w-9 h-9 flex items-center justify-center rounded border border-cyan-400/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-9 h-9 flex items-center justify-center rounded border border-cyan-400/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-cyan-400">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/threats"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition"
                >
                  Common Threats
                </Link>
              </li>

              <li>
                <Link
                  to="/tips"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition"
                >
                  Safety Tips
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-slate-300 hover:text-cyan-400 transition"
                >
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
                <Link
                  to="/incident-report"
                  className="text-sm text-slate-300 hover:text-fuchsia-500 transition"
                >
                  Report Incident
                </Link>
              </li>

              <li>
                <Link
                  to="/connection-checker"
                  className="text-sm text-slate-300 hover:text-fuchsia-500 transition"
                >
                  Wi‑Fi Safety Check
                </Link>
              </li>

              <li>
                <Link
                  to="/faq"
                  className="text-sm text-slate-300 hover:text-fuchsia-500 transition"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-300 hover:text-fuchsia-500 transition"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-cyan-400">
              Contact
            </h3>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-cyan-400 shrink-0" />

                <button
                  onClick={() => setContactOpen(true)}
                  className="hover:text-cyan-400 transition text-left"
                >
                  support@cybersafeafrica.org
                </button>
              </li>

              <li className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 text-cyan-400 shrink-0" />

                <a
                  href="tel:+27646714715"
                  className="hover:text-cyan-400 transition"
                >
                  +27 64 671 4715
                </a>
              </li>

              <li className="flex items-center gap-3">
                <FiMapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-8 border-t border-cyan-400/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {year} CyberSafe Africa. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link
                to="/terms"
                className="text-sm text-slate-400 hover:text-cyan-400 transition"
              >
                Terms of Service
              </Link>

              <Link
                to="/privacy"
                className="text-sm text-slate-400 hover:text-cyan-400 transition"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </footer>
  );
}

export default Footer;