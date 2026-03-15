import { REPORT_CLASSIFICATION_KEYWORDS, REPORT_TYPES } from "../utils/constants.js";

const countMatches = (text, keywords) =>
  keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);

export const classifyReport = (text = "") => {
  const normalized = text.toLowerCase();
  let bestType = REPORT_TYPES.GENERAL;
  let bestScore = 0;

  Object.entries(REPORT_CLASSIFICATION_KEYWORDS).forEach(([reportType, keywords]) => {
    const score = countMatches(normalized, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestType = reportType;
    }
  });

  return {
    reportType: bestType,
    confidence: bestScore === 0 ? 0.2 : Math.min(0.95, 0.3 + bestScore * 0.15)
  };
};

