export const HEALTH_DISCLAIMER =
  "This platform provides informational health insights only and is not a medical diagnosis. Please consult a licensed doctor.";

export const SUPPORTED_LANGUAGES = ["en", "hi", "bn"];

export const REPORT_TYPES = {
  CBC: "CBC Report",
  LIPID: "Lipid Profile",
  SUGAR: "Blood Sugar Report",
  LIVER: "Liver Function Test",
  KIDNEY: "Kidney Function Test",
  THYROID: "Thyroid Function Test",
  VITAMIN: "Vitamin Profile",
  GENERAL: "General Lab Report"
};

export const PARAMETER_CONFIG = {
  Hemoglobin: {
    keywords: ["hemoglobin", "haemoglobin", "hb", "hgb"],
    units: ["g/dl", "gm/dl", "gdl"],
    unit: "g/dL",
    reportTypes: [REPORT_TYPES.CBC],
    ranges: {
      male: { min: 13, max: 17 },
      female: { min: 12, max: 15 },
      default: { min: 12, max: 17 }
    },
    plausible: { min: 3, max: 25 },
    criticalLow: 7
  },
  WBC: {
    keywords: ["wbc", "white blood cell", "total leucocyte count", "total leukocyte count", "tlc"],
    units: ["/ul", "cells/cumm", "10^3/ul", "x10^3/ul"],
    unit: "/uL",
    reportTypes: [REPORT_TYPES.CBC],
    ranges: {
      default: { min: 4000, max: 11000 }
    },
    plausible: { min: 1000, max: 50000 },
    criticalLow: 2500,
    criticalHigh: 20000
  },
  RBC: {
    keywords: ["rbc", "red blood cell", "red blood cells"],
    units: ["million/ul", "10^6/ul", "mill/cumm", "mil/ul"],
    unit: "million/uL",
    reportTypes: [REPORT_TYPES.CBC],
    ranges: {
      male: { min: 4.5, max: 5.9 },
      female: { min: 4.1, max: 5.1 },
      default: { min: 4.1, max: 5.9 }
    },
    plausible: { min: 1.5, max: 8 },
    criticalLow: 3
  },
  Platelets: {
    keywords: ["platelet", "platelets", "platelet count", "platelet ct"],
    units: ["/ul", "lakhs/cumm", "10^3/ul", "x10^3/ul"],
    unit: "/uL",
    reportTypes: [REPORT_TYPES.CBC],
    ranges: {
      default: { min: 150000, max: 450000 }
    },
    plausible: { min: 10000, max: 1200000 },
    criticalLow: 50000
  },
  "Blood Sugar": {
    keywords: [
      "blood sugar",
      "fasting blood sugar",
      "fasting glucose",
      "glucose fasting",
      "fbs",
      "glucose"
    ],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.SUGAR],
    ranges: {
      default: { min: 70, max: 99 }
    },
    plausible: { min: 30, max: 700 },
    criticalLow: 54,
    criticalHigh: 300
  },
  Cholesterol: {
    keywords: ["cholesterol", "total cholesterol", "cholesterol total"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.LIPID],
    ranges: {
      default: { min: 125, max: 200 }
    },
    plausible: { min: 50, max: 500 },
    criticalHigh: 240
  },
  HDL: {
    keywords: ["hdl", "hdl cholesterol", "high density lipoprotein"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.LIPID],
    ranges: {
      default: { min: 40, max: 80 }
    },
    plausible: { min: 10, max: 120 },
    criticalLow: 25
  },
  LDL: {
    keywords: ["ldl", "ldl cholesterol", "low density lipoprotein"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.LIPID],
    ranges: {
      default: { min: 0, max: 100 }
    },
    plausible: { min: 20, max: 350 },
    criticalHigh: 190
  },
  Triglycerides: {
    keywords: ["triglycerides", "tg"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.LIPID],
    ranges: {
      default: { min: 0, max: 150 }
    },
    plausible: { min: 20, max: 1000 },
    criticalHigh: 500
  },
  ALT: {
    keywords: ["alt", "sgpt", "alanine aminotransferase"],
    units: ["u/l", "iu/l"],
    unit: "U/L",
    reportTypes: [REPORT_TYPES.LIVER],
    ranges: {
      default: { min: 7, max: 56 }
    },
    plausible: { min: 1, max: 1500 },
    criticalHigh: 300
  },
  AST: {
    keywords: ["ast", "sgot", "aspartate aminotransferase"],
    units: ["u/l", "iu/l"],
    unit: "U/L",
    reportTypes: [REPORT_TYPES.LIVER],
    ranges: {
      default: { min: 10, max: 40 }
    },
    plausible: { min: 1, max: 1500 },
    criticalHigh: 300
  },
  Creatinine: {
    keywords: ["creatinine", "serum creatinine"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.KIDNEY],
    ranges: {
      male: { min: 0.74, max: 1.35 },
      female: { min: 0.59, max: 1.04 },
      default: { min: 0.59, max: 1.35 }
    },
    plausible: { min: 0.1, max: 20 },
    criticalHigh: 4
  },
  Urea: {
    keywords: ["urea", "blood urea", "serum urea"],
    units: ["mg/dl", "mg dl"],
    unit: "mg/dL",
    reportTypes: [REPORT_TYPES.KIDNEY],
    ranges: {
      default: { min: 15, max: 40 }
    },
    plausible: { min: 5, max: 300 },
    criticalHigh: 120
  },
  "Vitamin D": {
    keywords: ["vitamin d", "25-oh vitamin d", "25 hydroxy vitamin d", "25(oh)d"],
    units: ["ng/ml", "ng ml"],
    unit: "ng/mL",
    reportTypes: [REPORT_TYPES.VITAMIN],
    ranges: {
      default: { min: 30, max: 100 }
    },
    plausible: { min: 3, max: 200 },
    criticalLow: 10
  },
  TSH: {
    keywords: ["tsh", "thyroid stimulating hormone"],
    units: ["uiu/ml", "miu/l", "uIU/mL", "µiu/ml"],
    unit: "uIU/mL",
    reportTypes: [REPORT_TYPES.THYROID],
    ranges: {
      default: { min: 0.4, max: 4.5 }
    },
    plausible: { min: 0.01, max: 100 },
    criticalHigh: 20
  },
  HbA1c: {
    keywords: ["hba1c", "hb a1c", "glycated hemoglobin"],
    units: ["%", "percent"],
    unit: "%",
    reportTypes: [REPORT_TYPES.SUGAR],
    ranges: {
      default: { min: 4, max: 5.6 }
    },
    plausible: { min: 3, max: 18 },
    criticalHigh: 9
  }
};

export const REPORT_CLASSIFICATION_KEYWORDS = {
  [REPORT_TYPES.CBC]: [
    "hemoglobin",
    "wbc",
    "rbc",
    "platelet",
    "hematocrit",
    "mcv"
  ],
  [REPORT_TYPES.LIPID]: [
    "cholesterol",
    "hdl",
    "ldl",
    "triglycerides",
    "vldl"
  ],
  [REPORT_TYPES.SUGAR]: [
    "glucose",
    "fbs",
    "ppbs",
    "hba1c",
    "blood sugar"
  ],
  [REPORT_TYPES.LIVER]: [
    "bilirubin",
    "sgpt",
    "sgot",
    "alp",
    "liver function"
  ],
  [REPORT_TYPES.KIDNEY]: [
    "creatinine",
    "urea",
    "bun",
    "kidney function",
    "egfr"
  ],
  [REPORT_TYPES.THYROID]: [
    "tsh",
    "t3",
    "t4",
    "thyroid"
  ],
  [REPORT_TYPES.VITAMIN]: [
    "vitamin d",
    "b12",
    "folate"
  ]
};

export const WARNING_MESSAGES = {
  low: "Below the usual reference range. Please discuss with a doctor if this is new or worsening.",
  high: "Above the usual reference range. Please discuss with a doctor, especially if you have symptoms.",
  critical: "Critical value detected. Please consult a doctor."
};

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;
export const DEFAULT_SHARE_LINK_HOURS = 24;
export const DEFAULT_CACHE_TTL_SECONDS = 60 * 60;
export const DEFAULT_AI_CACHE_TTL_SECONDS = 60 * 60 * 6;
export const REPORT_PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
};
export const PRESCRIPTION_PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
};
