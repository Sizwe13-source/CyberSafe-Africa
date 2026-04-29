//components/SectionHeader.jsx
import { motion } from "framer-motion";

function SectionHeader({ title, subtitle, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12 text-center"
    >
      {/* TITLE */}
      <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl leading-tight">
        {title}{" "}
        {highlight && (
          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>

      {/* SUBTITLE */}
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-slate-400 text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* DECORATIVE LINE */}
      <div className="mt-6 flex justify-center">
        <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-60" />
      </div>
    </motion.div>
  );
}

export default SectionHeader;