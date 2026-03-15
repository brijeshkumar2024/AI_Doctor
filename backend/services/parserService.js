import { PARAMETER_CONFIG, WARNING_MESSAGES } from "../utils/constants.js";

const normalizeText = (text = "") => text.toLowerCase().replace(/\s+/g, " ").trim();

export const getRangeForParameter = (config, gender = "") =>
  config.ranges[gender] || config.ranges.default || config.ranges.female || config.ranges.male;

const buildRangeLabel = (range) => `${range.min}-${range.max}`;

const determineStatus = (value, range) => {
  if (value < range.min) {
    return "Low";
  }
  if (value > range.max) {
    return "High";
  }
  return "Normal";
};

const determineWarning = (config, value, status) => {
  if (
    (config.criticalLow !== undefined && value <= config.criticalLow) ||
    (config.criticalHigh !== undefined && value >= config.criticalHigh)
  ) {
    return WARNING_MESSAGES.critical;
  }
  if (status === "Low") {
    return WARNING_MESSAGES.low;
  }
  if (status === "High") {
    return WARNING_MESSAGES.high;
  }
  return "";
};

const convertValueForParameter = (parameter, numericValue, unit = "") => {
  const normalizedUnit = normalizeText(unit);

  if (["WBC", "Platelets"].includes(parameter)) {
    if (normalizedUnit.includes("10^3") || normalizedUnit.includes("x10^3")) {
      return numericValue * 1000;
    }
    if (normalizedUnit.includes("lakhs")) {
      return numericValue * 100000;
    }
  }

  return numericValue;
};

const isPlausible = (config, value) =>
  value >= config.plausible.min && value <= config.plausible.max;

const getCandidateConfidence = ({
  rowMatch,
  keywordMatch,
  unitMatch,
  plausible,
  valueText,
  usedColumns,
  referenceRangeAware
}) => {
  let score = 0.2;
  if (rowMatch) score += 0.2;
  if (keywordMatch) score += 0.2;
  if (unitMatch) score += 0.15;
  if (plausible) score += 0.15;
  if (valueText?.includes(".")) score += 0.05;
  if (usedColumns) score += 0.05;
  if (referenceRangeAware) score += 0.1;
  return Math.max(0.1, Math.min(0.99, score));
};

const isReferenceRangeColumn = (column = "") =>
  /\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?/.test(column) ||
  /(?:range|reference|normal)/i.test(column);

const isNumericColumn = (column = "") =>
  /^<?>?\s*\d+(?:\.\d+)?(?:\s*[a-z/%^].*)?$/i.test(column.trim());

const extractColumnNumber = (column = "") => {
  const match = column.match(/<?>?\s*(\d+(?:\.\d+)?)/);
  return match?.[1] || null;
};

export const normalizeParameterName = (rawParameter = "") => {
  const normalized = normalizeText(rawParameter);
  const directMatch = Object.keys(PARAMETER_CONFIG).find(
    (parameter) => normalizeText(parameter) === normalized
  );

  if (directMatch) {
    return directMatch;
  }

  return (
    Object.entries(PARAMETER_CONFIG).find(([, config]) =>
      config.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
    )?.[0] || null
  );
};

export const normalizeStructuredValue = ({ parameter, value, unit = "", referenceRange = "", confidence = 0.5 }, gender = "") => {
  const normalizedParameter = normalizeParameterName(parameter);

  if (!normalizedParameter) {
    return null;
  }

  const config = PARAMETER_CONFIG[normalizedParameter];
  const numericValue = convertValueForParameter(normalizedParameter, Number(value), unit);

  if (Number.isNaN(numericValue) || !isPlausible(config, numericValue)) {
    return null;
  }

  const range = getRangeForParameter(config, gender);
  const status = determineStatus(numericValue, range);

  return {
    parameter: normalizedParameter,
    value: Number(numericValue.toFixed(2)),
    rawValue: String(value),
    unit: unit || config.unit,
    status,
    normalRange: referenceRange || buildRangeLabel(range),
    warning: determineWarning(config, numericValue, status),
    detectedText: `${parameter} ${value} ${unit}`.trim(),
    confidence: Number(Math.max(0.1, Math.min(0.99, confidence)).toFixed(2)),
    notes: []
  };
};

export const normalizeStructuredValues = (values = [], gender = "") => {
  const uniqueByParameter = new Map();

  values.forEach((value) => {
    const normalized = normalizeStructuredValue(value, gender);
    if (!normalized) {
      return;
    }

    const existing = uniqueByParameter.get(normalized.parameter);
    if (!existing || normalized.confidence > existing.confidence) {
      uniqueByParameter.set(normalized.parameter, normalized);
    }
  });

  const normalizedValues = [...uniqueByParameter.values()];
  const averageConfidence =
    normalizedValues.length > 0
      ? normalizedValues.reduce((sum, item) => sum + item.confidence, 0) / normalizedValues.length
      : 0;

  return {
    structuredValues: normalizedValues,
    metadata: {
      tableRowsDetected: 0,
      extractedValueCount: normalizedValues.length,
      averageConfidence: Number(averageConfidence.toFixed(2))
    }
  };
};

const extractValueFromRow = (row, config, parameter) => {
  const rowText = row.raw;
  const rowLower = normalizeText(rowText);
  const matchedKeyword = config.keywords.find((keyword) => rowLower.includes(keyword));

  if (!matchedKeyword) {
    return null;
  }

  const referenceColumnIndexes = new Set(
    row.columns
      .map((column, index) => (isReferenceRangeColumn(column) ? index : null))
      .filter((value) => value !== null)
  );
  const keywordColumnIndex = row.columns.findIndex((column) =>
    normalizeText(column).includes(normalizeText(matchedKeyword))
  );

  const candidates = row.columns
    .map((column, index) => ({
      column,
      index,
      numericText: extractColumnNumber(column)
    }))
    .filter((candidate) => candidate.numericText && !referenceColumnIndexes.has(candidate.index))
    .sort((left, right) => {
      const leftDistance = keywordColumnIndex === -1 ? 99 : Math.abs(left.index - keywordColumnIndex);
      const rightDistance = keywordColumnIndex === -1 ? 99 : Math.abs(right.index - keywordColumnIndex);
      return leftDistance - rightDistance;
    });

  const bestCandidate = candidates.find((candidate) => {
    const convertedValue = convertValueForParameter(parameter, Number(candidate.numericText), candidate.column);
    return isPlausible(config, convertedValue);
  });

  if (!bestCandidate) {
    return null;
  }

  const numericValue = convertValueForParameter(parameter, Number(bestCandidate.numericText), bestCandidate.column);
  const unitMatch = config.units.find((unit) => rowLower.includes(unit));
  const referenceRangeText = row.columns.find((column) => isReferenceRangeColumn(column)) || "";

  return {
    parameter,
    value: numericValue,
    rawValue: bestCandidate.numericText,
    matchedKeyword,
    detectedText: rowText,
    unit: unitMatch ? config.unit : config.unit,
    referenceRange: referenceRangeText,
    confidence: getCandidateConfidence({
      rowMatch: true,
      keywordMatch: true,
      unitMatch: Boolean(unitMatch),
      plausible: true,
      valueText: bestCandidate.numericText,
      usedColumns: row.columns?.length > 0,
      referenceRangeAware: Boolean(referenceRangeText)
    }),
    notes: referenceRangeText ? ["Reference range detected in the same row."] : []
  };
};

const extractValueFromText = (text, config, parameter) => {
  const keywordPattern = config.keywords
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = new RegExp(
    `(?:${keywordPattern})[^\\d]{0,40}(\\d+(?:\\.\\d+)?)(?:\\s*([a-zA-Z/%^]+))?(?:[^\\n]{0,30}?(\\d+(?:\\.\\d+)?\\s*-\\s*\\d+(?:\\.\\d+)?))?`,
    "i"
  );
  const match = text.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  const numericValue = convertValueForParameter(parameter, Number(match[1]), match[2] || "");
  if (!isPlausible(config, numericValue)) {
    return null;
  }

  return {
    parameter,
    value: numericValue,
    rawValue: match[1],
    matchedKeyword: match[0],
    detectedText: match[0],
    unit: config.unit,
    referenceRange: match[3] || "",
    confidence: getCandidateConfidence({
      rowMatch: false,
      keywordMatch: true,
      unitMatch: Boolean(match[2]),
      plausible: true,
      valueText: match[1],
      usedColumns: false,
      referenceRangeAware: Boolean(match[3])
    }),
    notes: ["Value extracted using fallback parsing."]
  };
};

export const parseMedicalValues = ({ cleanedText = "", tableRows = [], gender = "" }) => {
  const values = [];
  const lowerText = normalizeText(cleanedText);

  Object.entries(PARAMETER_CONFIG).forEach(([parameter, config]) => {
    let candidate = null;

    for (const row of tableRows) {
      candidate = extractValueFromRow(row, config, parameter);
      if (candidate) {
        break;
      }
    }

    if (!candidate) {
      candidate = extractValueFromText(lowerText, config, parameter);
    }

    if (!candidate) {
      return;
    }

    const normalized = normalizeStructuredValue(
      {
        parameter,
        value: candidate.value,
        unit: candidate.unit,
        referenceRange: candidate.referenceRange,
        confidence: candidate.confidence
      },
      gender
    );

    if (!normalized) {
      return;
    }

    values.push({
      ...normalized,
      rawValue: candidate.rawValue,
      detectedText: candidate.detectedText,
      notes: candidate.notes
    });
  });

  const averageConfidence =
    values.length > 0 ? values.reduce((sum, item) => sum + item.confidence, 0) / values.length : 0;

  return {
    structuredValues: values,
    metadata: {
      tableRowsDetected: tableRows.length,
      extractedValueCount: values.length,
      averageConfidence: Number(averageConfidence.toFixed(2))
    }
  };
};

export const parsePrescriptionText = (text = "") => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const match = line.match(
        /^([A-Za-z][A-Za-z0-9\s-]{2,})(?:\s+(\d+(?:\.\d+)?\s?(?:mg|ml|mcg)))?(?:\s+(?:once|twice|thrice).*)?$/i
      );
      if (!match) {
        return null;
      }

      return {
        name: match[1].trim(),
        dosage: match[2] || "Use as prescribed",
        purpose: "General purpose explanation generated by AI"
      };
    })
    .filter(Boolean)
    .slice(0, 10);
};
