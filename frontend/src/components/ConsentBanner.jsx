// src/components/ConsentBanner.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, hasConsentDecision, setConsent } from "../utils/analytics";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasConsentDecision());
  }, []);

  if (!visible) return null;

  const choose = (granted) => {
    setConsent(granted);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and activity consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-white/10 px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/80">
          We'd like to record which outbound links you click, so we can spot
          scam links people are running into. We never record anything you
          type. See our{" "}
          <Link to="/privacy" className="underline text-white">
            privacy &amp; data rights
          </Link>{" "}
          page for details. You can change this choice at any time.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose(false)}
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-[#090e20] hover:bg-cyan-400"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
