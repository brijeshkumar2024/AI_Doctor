import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { formatParameterName, getParameterIcon, PARAMETER_PATTERNS } from "../utils/healthParams";

const MiniTrendSparkline = ({ parameter, reportDate }) => {
  const { data: trendData } = useQuery({
    queryKey: ["trends", parameter],
    queryFn: async () => {
      const response = await fetch(`/api/trends?parameter=${parameter}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!parameter,
    staleTime: 5 * 60 * 1000
  });

  if (!trendData?.data?.dataPoints || trendData.data.dataPoints.length < 2) {
    return null;
  }

  // Get last 5 data points
  const recentPoints = trendData.data.dataPoints
    .sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate))
    .slice(-5)
    .map(point => ({ value: point.value }));

  const trend = trendData.data.trend;
  const isWorsening = trend.direction === "worsening";
  const isImproving = trend.direction === "improving";

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Your Trend</span>
        <span className={`text-xs font-medium ${isWorsening ? "text-red-600" : isImproving ? "text-green-600" : "text-gray-600"}`}>
          {isWorsening ? "↘️" : isImproving ? "↗️" : "→"}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={recentPoints}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isWorsening ? "#ef4444" : isImproving ? "#22c55e" : "#6b7280"}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniTrendSparkline;