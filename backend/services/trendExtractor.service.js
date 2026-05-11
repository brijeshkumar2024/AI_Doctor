import { format, subMonths, subYears } from "date-fns";

export const PARAMETER_PATTERNS = {
  bloodGlucose: {
    aliases: ["glucose", "blood sugar", "fasting glucose", "FBS", "RBS"],
    unit: "mg/dL",
    normalRange: { min: 70, max: 100 }
  },
  cholesterolTotal: {
    aliases: ["total cholesterol", "cholesterol"],
    unit: "mg/dL",
    normalRange: { min: 0, max: 200 }
  },
  hdl: {
    aliases: ["HDL", "good cholesterol"],
    unit: "mg/dL",
    normalRange: { min: 40, max: 60 }
  },
  ldl: {
    aliases: ["LDL", "bad cholesterol"],
    unit: "mg/dL",
    normalRange: { min: 0, max: 100 }
  },
  hemoglobin: {
    aliases: ["hemoglobin", "Hb", "haemoglobin"],
    unit: "g/dL",
    normalRange: { min: 12, max: 17 }
  },
  systolicBP: {
    aliases: ["systolic", "SBP"],
    unit: "mmHg",
    normalRange: { min: 90, max: 120 }
  },
  diastolicBP: {
    aliases: ["diastolic", "DBP"],
    unit: "mmHg",
    normalRange: { min: 60, max: 80 }
  },
  creatinine: {
    aliases: ["creatinine", "serum creatinine"],
    unit: "mg/dL",
    normalRange: { min: 0.6, max: 1.2 }
  },
  tsh: {
    aliases: ["TSH", "thyroid stimulating hormone"],
    unit: "mIU/L",
    normalRange: { min: 0.4, max: 4.0 }
  },
  wbc: {
    aliases: ["WBC", "white blood cells", "leukocytes"],
    unit: "cells/mcL",
    normalRange: { min: 4500, max: 11000 }
  }
};

const parseNumericValue = (valueString) => {
  if (!valueString) return null;

  // Extract first number from strings like "95 mg/dL", "95.5", "95-100"
  const match = valueString.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

const determineStatus = (value, normalRange) => {
  if (value < normalRange.min) return "low";
  if (value > normalRange.max) return "high";
  return "normal";
};

const findParameterMatch = (parameterName) => {
  const lowerParam = parameterName.toLowerCase();
  for (const [key, pattern] of Object.entries(PARAMETER_PATTERNS)) {
    if (pattern.aliases.some(alias => lowerParam.includes(alias.toLowerCase()))) {
      return key;
    }
  }
  return null;
};

export const extractHealthMetrics = (keyFindings, reportId, userId, reportDate) => {
  const metrics = [];
  const seenParameters = new Set();

  keyFindings.forEach(finding => {
    const parameter = findParameterMatch(finding.parameter);
    if (!parameter || seenParameters.has(parameter)) return;

    const value = parseNumericValue(finding.value);
    if (value === null) return;

    const pattern = PARAMETER_PATTERNS[parameter];
    const status = determineStatus(value, pattern.normalRange);

    metrics.push({
      userId,
      reportId,
      parameter,
      value,
      unit: pattern.unit,
      status,
      reportDate
    });

    seenParameters.add(parameter);
  });

  return metrics;
};

export const calculateTrend = (dataPoints, normalRange) => {
  if (dataPoints.length < 2) {
    return { direction: "insufficient_data" };
  }

  const sortedPoints = dataPoints.sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));
  const firstValue = sortedPoints[0].value;
  const latestValue = sortedPoints[sortedPoints.length - 1].value;

  const midpoint = (normalRange.min + normalRange.max) / 2;
  const firstDistance = Math.abs(firstValue - midpoint);
  const latestDistance = Math.abs(latestValue - midpoint);

  let direction;
  if (latestDistance < firstDistance) {
    direction = "improving";
  } else if (latestDistance > firstDistance) {
    direction = "worsening";
  } else {
    const changePercent = Math.abs((latestValue - firstValue) / firstValue) * 100;
    direction = changePercent < 5 ? "stable" : "worsening";
  }

  const trendPercentage = ((latestValue - firstValue) / firstValue) * 100;

  return {
    direction,
    trendPercentage: Math.round(trendPercentage * 100) / 100,
    firstValue,
    latestValue
  };
};