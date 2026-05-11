export const HEALTH_PARAMS = {
  bloodGlucose: {
    label: "Blood Glucose",
    icon: "🩸",
    color: "#ef4444"
  },
  cholesterolTotal: {
    label: "Total Cholesterol",
    icon: "🫀",
    color: "#f97316"
  },
  hdl: {
    label: "HDL Cholesterol",
    icon: "💚",
    color: "#22c55e"
  },
  ldl: {
    label: "LDL Cholesterol",
    icon: "⚠️",
    color: "#eab308"
  },
  hemoglobin: {
    label: "Hemoglobin",
    icon: "🔴",
    color: "#dc2626"
  },
  systolicBP: {
    label: "Systolic BP",
    icon: "🫀",
    color: "#7c3aed"
  },
  diastolicBP: {
    label: "Diastolic BP",
    icon: "🫀",
    color: "#6d28d9"
  },
  creatinine: {
    label: "Creatinine",
    icon: "🧪",
    color: "#0891b2"
  },
  tsh: {
    label: "TSH (Thyroid)",
    icon: "🦋",
    color: "#059669"
  },
  wbc: {
    label: "WBC Count",
    icon: "🛡️",
    color: "#2563eb"
  }
};

export const formatParameterName = (param) => {
  return HEALTH_PARAMS[param]?.label || param.replace(/([A-Z])/g, ' $1').trim();
};

export const getParameterIcon = (param) => {
  return HEALTH_PARAMS[param]?.icon || "📊";
};

export const getParameterColor = (param) => {
  return HEALTH_PARAMS[param]?.color || "#6b7280";
};