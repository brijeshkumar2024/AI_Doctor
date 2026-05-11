import { useMemo } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ReferenceLine, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { getParameterColor } from "../../utils/healthParams";

const TrendChart = ({ parameter, unit, normalRange, dataPoints, trend }) => {
  const chartData = useMemo(() => {
    return dataPoints.map(point => ({
      date: point.reportDate,
      value: point.value,
      status: point.status,
      reportId: point.reportId
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dataPoints]);

  const getDotColor = (status) => {
    switch (status) {
      case "normal": return "#22c55e";
      case "low": return "#eab308";
      case "high": return "#f97316";
      case "critical": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={getDotColor(payload.status)}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{format(new Date(label), "MMM dd, yyyy")}</p>
          <p className="text-lg font-bold">{data.value} {unit}</p>
          <p className={`text-sm ${data.status === "normal" ? "text-green-600" : "text-red-600"}`}>
            Status: {data.status} {data.status === "normal" ? "✓" : "⚠️"}
          </p>
          <button
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            onClick={() => window.open(`/reports/${data.reportId}`, "_blank")}
          >
            View Report →
          </button>
        </div>
      );
    }
    return null;
  };

  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="w-full">
      {trend.direction !== "insufficient_data" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {trend.direction === "improving" ? "📈" : trend.direction === "worsening" ? "📉" : "📊"}
            </span>
            <div>
              <p className="font-medium">
                {trend.direction === "improving" ? "Improving" :
                 trend.direction === "worsening" ? "Worsening" : "Stable"}
                {trend.direction !== "stable" && ` — ${Math.abs(trend.trendPercentage)}%`}
              </p>
              <p className="text-sm text-gray-600">
                From {trend.firstValue} to {trend.latestValue} {unit}
              </p>
            </div>
          </div>
        </div>
      )}

      {chartData.length === 1 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📊 Upload more reports to see trend line
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => format(new Date(value), "MMM dd")}
            stroke="#6b7280"
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Normal range area */}
          <ReferenceArea
            y1={normalRange.min}
            y2={normalRange.max}
            fill="#dcfce7"
            fillOpacity={0.3}
          />

          {/* Normal range lines */}
          <ReferenceLine y={normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
          <ReferenceLine y={normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />

          <Line
            type="monotone"
            dataKey="value"
            stroke={getParameterColor(parameter)}
            strokeWidth={2}
            dot={<CustomDot />}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;