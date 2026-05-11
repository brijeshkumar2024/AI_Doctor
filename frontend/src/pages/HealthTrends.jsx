import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { subMonths, subYears, format } from "date-fns";
import TrendSummaryCard from "../components/TrendSummaryCard";
import TrendChart from "../components/TrendChart";
import { formatParameterName, getParameterIcon } from "../utils/healthParams";

const HealthTrends = () => {
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["trends", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/trends/summary");
      if (!response.ok) throw new Error("Failed to fetch summary");
      return response.json();
    }
  });

  const { data: parametersData } = useQuery({
    queryKey: ["trends", "parameters"],
    queryFn: async () => {
      const response = await fetch("/api/trends/parameters");
      if (!response.ok) throw new Error("Failed to fetch parameters");
      return response.json();
    }
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["trends", selectedParameter, dateRange],
    queryFn: async () => {
      if (!selectedParameter) return null;

      let from = null;
      const to = new Date();

      switch (dateRange) {
        case "3months":
          from = subMonths(to, 3);
          break;
        case "6months":
          from = subMonths(to, 6);
          break;
        case "1year":
          from = subYears(to, 1);
          break;
        default:
          from = null;
      }

      const params = new URLSearchParams({ parameter: selectedParameter });
      if (from) params.append("from", format(from, "yyyy-MM-dd"));
      if (to) params.append("to", format(to, "yyyy-MM-dd"));

      const response = await fetch(`/api/trends?${params}`);
      if (!response.ok) throw new Error("Failed to fetch trend data");
      return response.json();
    },
    enabled: !!selectedParameter
  });

  const handleParameterSelect = (parameter) => {
    setSelectedParameter(parameter);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const hasData = summaryData?.data?.summary?.length > 0;

  if (summaryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Trends</h1>
          <p className="text-gray-600">Track your health metrics over time with AI-powered analysis</p>
        </div>

        {!hasData ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trend data yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Upload at least 2 medical reports to start tracking your health trends.
              Your biomarkers will appear here automatically.
            </p>
            <button
              onClick={() => window.location.href = "/upload"}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Report
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {summaryData.data.summary.map((item) => (
                <div key={item.parameter} onClick={() => handleParameterSelect(item.parameter)}>
                  <TrendSummaryCard {...item} />
                </div>
              ))}
            </div>

            {/* Parameter Selector */}
            {parametersData?.data?.parameters?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Parameter</h2>
                <div className="flex flex-wrap gap-2">
                  {parametersData.data.parameters.map((param) => (
                    <button
                      key={param}
                      onClick={() => handleParameterSelect(param)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedParameter === param
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-2">{getParameterIcon(param)}</span>
                      {formatParameterName(param)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            {selectedParameter && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Date Range</h2>
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All Time" },
                    { key: "1year", label: "Last Year" },
                    { key: "6months", label: "Last 6 Months" },
                    { key: "3months", label: "Last 3 Months" }
                  ].map((range) => (
                    <button
                      key={range.key}
                      onClick={() => handleDateRangeChange(range.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dateRange === range.key
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chart */}
            {selectedParameter && trendData && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {formatParameterName(selectedParameter)} Trend
                </h2>
                {trendLoading ? (
                  <div className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <TrendChart {...trendData.data} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthTrends;