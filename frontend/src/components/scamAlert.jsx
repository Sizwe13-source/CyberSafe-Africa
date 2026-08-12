// components/ScamAlertBanner.jsx
import { FiAlertTriangle } from "react-icons/fi";

function ScamAlertBanner() {
  const message = "Scam ALERT: SARS SMS links for AUTO Assessments";

  return (
    <div
      role="alert"
      className="w-full bg-[#D85A30] text-white overflow-hidden relative"
      style={{ height: "36px" }}
    >
      <style>{`
        @keyframes scam-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .scam-track {
          animation: scam-marquee 18s linear infinite;
        }
        .scam-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="scam-track flex items-center gap-16 whitespace-nowrap absolute top-0 left-0 h-full">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-16 pr-16">
            {Array.from({ length: 4 }).map((_, j) => (
              <span key={j} className="flex items-center gap-2 text-sm font-medium px-4">
                <FiAlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScamAlertBanner;