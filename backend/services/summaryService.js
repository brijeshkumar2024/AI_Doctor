export const buildDoctorStyleSummary = (structuredValues = [], aiAnalysis = null) => {
  const abnormal = structuredValues.filter((item) => item.status !== "Normal");
  if (abnormal.length === 0) {
    return [
      "No clearly abnormal tracked values were detected in the parsed report.",
      "Clinical interpretation should still be based on full medical context."
    ];
  }

  const summary = abnormal.slice(0, 5).map((item) => {
    const direction = item.status === "Low" ? "slightly low" : item.status === "High" ? "elevated" : "within range";
    return `${item.parameter} is ${direction} at ${item.value} ${item.unit}.`;
  });

  if (aiAnalysis?.recommendations?.[0]) {
    summary.push(`Recommendation: ${aiAnalysis.recommendations[0]}`);
  }

  return summary;
};

export const buildTimelineSummary = (trendInsights = [], riskFactors = []) => {
  const items = [];

  trendInsights.slice(0, 4).forEach((trend) => {
    items.push(trend.insight);
  });

  riskFactors.slice(0, 3).forEach((factor) => {
    items.push(factor);
  });

  return items;
};
