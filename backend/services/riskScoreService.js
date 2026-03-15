export const calculateRiskScoreDetails = ({
  structuredValues = [],
  trendInsights = [],
  symptomText = ""
}) => {
  let score = 10;
  const factors = [];

  structuredValues.forEach((item) => {
    if (item.warning?.toLowerCase().includes("critical")) {
      score += 25;
      factors.push(`${item.parameter} is in a critical range.`);
    } else if (item.status === "High" || item.status === "Low") {
      score += 10;
      factors.push(`${item.parameter} is ${item.status.toLowerCase()} compared with the usual range.`);
    }

    if (item.confidence < 0.5) {
      score -= 2;
      factors.push(`${item.parameter} has low extraction confidence and should be checked manually.`);
    }
  });

  trendInsights.forEach((trend) => {
    if (trend.insight.toLowerCase().includes("decreasing")) {
      score += 8;
      factors.push(`${trend.parameter} is decreasing over time.`);
    }
    if (trend.insight.toLowerCase().includes("increasing") && trend.parameter === "Blood Sugar") {
      score += 8;
      factors.push("Blood sugar is increasing over time.");
    }
  });

  const symptomFlags = ["breathing", "chest pain", "persistent fever", "vomiting", "fainting"];
  const normalizedSymptoms = symptomText.toLowerCase();
  if (symptomFlags.some((flag) => normalizedSymptoms.includes(flag))) {
    score += 12;
    factors.push("Reported symptoms include escalation warning signs.");
  }

  const normalizedScore = Math.max(5, Math.min(95, Math.round(score)));

  return {
    score: normalizedScore,
    factors
  };
};

export const calculateRiskScore = (input = {}) => calculateRiskScoreDetails(input).score;
