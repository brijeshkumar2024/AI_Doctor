import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const TrendLineChart = ({ title, points = [] }) => (
  <div className="card hero-panel">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {points.length === 0 ? (
      <p className="mt-3 text-sm text-slate-600">Not enough history yet.</p>
    ) : (
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8ded9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)"
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#1c4742" strokeWidth={3} dot={{ r: 3, fill: "#1c4742" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

export default TrendLineChart;
