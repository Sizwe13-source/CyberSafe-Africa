//components/TipCard.jsx
import { motion } from "framer-motion";

function TipCard({
  title = "Tip",
  description = "",
  recommended = false,
  accent = "emerald"
}) {
  const accentStyles =
    accent === "cyan"
      ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-400"
      : accent === "fuchsia"
      ? "border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-400"
      : "border-emerald-400/20 bg-emerald-400/5 text-emerald-400";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border ${accentStyles} p-6 shadow-lg backdrop-blur-xl`}
    >
      {/* 🔥 Recommended badge */}
      {recommended && (
        <span className="mb-2 inline-block text-xs uppercase tracking-wide text-cyan-400">
          Recommended
        </span>
      )}

      {/* Title */}
      <h3 className="mb-3 text-lg font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default TipCard;