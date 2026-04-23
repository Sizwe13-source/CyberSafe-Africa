import { motion } from "framer-motion";

function ThreatCard({ title, description, warning, accent = "cyan" }) {
  const accentStyles =
    accent === "magenta"
      ? "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5"
      : "text-cyan-400 border-cyan-400/20 bg-cyan-400/5";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border ${accentStyles} p-6 shadow-lg backdrop-blur-xl`}
    >
      {/* TITLE */}
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>

      {/* DESCRIPTION */}
      <p className="mb-4 text-slate-300 text-sm leading-relaxed">
        {description}
      </p>

      {/* WARNING BOX */}
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
        <span className="font-semibold text-red-400">
          ⚠️ Warning sign:
        </span>{" "}
        {warning}
      </div>
    </motion.div>
  );
}

export default ThreatCard;