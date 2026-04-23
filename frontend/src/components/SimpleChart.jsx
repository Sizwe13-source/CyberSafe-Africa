import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

/* ===============================
   🎨 COLOR SYSTEM (GRADIENT LOOK)
================================ */
const COLORS = [
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#a855f7", // purple
];

/* ===============================
   🎯 CUSTOM TOOLTIP
================================ */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;

  return (
    <div className="bg-[#020617] border border-white/10 px-4 py-2 rounded-xl shadow-xl backdrop-blur-md">
      <p className="text-xs text-purple-400 font-semibold">
        {label}
      </p>
      <p className="text-sm text-white">
        {value} incidents
      </p>
    </div>
  );
};

/* ===============================
   🚀 MAIN COMPONENT
================================ */
function SimpleChart({ data = [] }) {
  // 🔥 Normalize + sort (important for premium feel)
  const safeData = Array.isArray(data)
    ? data
        .map((item) => ({
          name: item.name || item.type || "Unknown",
          value: Number(item.value ?? item.count ?? 0),
        }))
        .filter((i) => i.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  // 🔥 EMPTY STATE
  if (!safeData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] text-slate-400">
        <p className="text-sm">No threat activity yet</p>
        <p className="text-xs text-slate-500 mt-1">
          System will visualize threats here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">

      {/* HEADER */}
      <div className="mb-3">
        <p className="text-sm text-slate-400">
          Threat Distribution
        </p>
        <h3 className="text-lg font-semibold">
          Incident Overview
        </h3>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={safeData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          {/* GRID */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            opacity={0.3}
          />

          {/* X AXIS */}
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
          />

          {/* Y AXIS */}
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />

          {/* TOOLTIP */}
          <Tooltip content={<CustomTooltip />} />

          {/* BAR */}
          <Bar
            dataKey="value"
            radius={[10, 10, 0, 0]}
            animationDuration={800}
          >
            {safeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SimpleChart;