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
  <div className="card">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {points.length === 0 ? (
      <p className="mt-3 text-sm text-slate-600">Not enough history yet.</p>
    ) : (
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

export default TrendLineChart;

