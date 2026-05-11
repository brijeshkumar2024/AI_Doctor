import { formatParameterName, getParameterIcon, getParameterColor } from "../utils/healthParams";

const TrendSummaryCard = ({ parameter, unit, latestValue, latestStatus, trend, normalRange, dataPointCount }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "normal": return "text-green-600 bg-green-50";
      case "low": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case "improving": return "↗️";
      case "worsening": return "↘️";
      case "stable": return "→";
      default: return "📊";
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case "improving": return "text-green-600";
      case "worsening": return "text-red-600";
      case "stable": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getParameterIcon(parameter)}</span>
          <h3 className="font-semibold text-gray-900">{formatParameterName(parameter)}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(latestStatus)}`}>
          {latestStatus.toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {latestValue} <span className="text-sm font-normal text-gray-500">{unit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span className={`font-medium ${getTrendColor(trend.direction)}`}>
          {getTrendIcon(trend.direction)} {trend.direction === "insufficient_data" ? "Need more data" : `${trend.trendPercentage}%`}
        </span>
        <span>{dataPointCount} reports</span>
      </div>

      <div className="text-xs text-gray-500">
        Normal: {normalRange.min}–{normalRange.max} {unit}
      </div>
    </div>
  );
};

export default TrendSummaryCard;