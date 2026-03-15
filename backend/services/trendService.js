export const buildHealthTrends = (records = []) => {
  const grouped = records.reduce((accumulator, record) => {
    if (!accumulator[record.parameter]) {
      accumulator[record.parameter] = [];
    }

    accumulator[record.parameter].push({
      value: record.value,
      status: record.status,
      measuredAt: record.measuredAt,
      reportType: record.reportType
    });

    return accumulator;
  }, {});

  return Object.entries(grouped).map(([parameter, values]) => {
    const sortedValues = values.sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
    const first = sortedValues[0];
    const last = sortedValues[sortedValues.length - 1];

    let insight = "Stable over time.";
    if (last.value > first.value) {
      insight = `${parameter} is increasing over time.`;
    } else if (last.value < first.value) {
      insight = `${parameter} is decreasing over time.`;
    }

    return {
      parameter,
      points: sortedValues,
      insight
    };
  });
};

export const buildChartSeries = (
  records = [],
  trackedParameters = ["Hemoglobin", "Platelets", "Blood Sugar", "HbA1c"]
) =>
  trackedParameters.map((parameter) => ({
    parameter,
    points: records
      .filter((record) => record.parameter === parameter)
      .sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt))
      .map((record) => ({
        date: new Date(record.measuredAt).toLocaleDateString(),
        value: record.value
      }))
  }));

export const buildTimelineData = (records = []) =>
  records
    .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))
    .slice(0, 20)
    .map((record) => ({
      id: `${record.parameter}-${record._id}`,
      parameter: record.parameter,
      value: record.value,
      unit: record.unit,
      status: record.status,
      measuredAt: record.measuredAt,
      reportType: record.reportType
    }));

export const buildReportComparisons = (reports = []) =>
  reports.slice(0, 5).map((report) => ({
    reportId: report._id,
    fileName: report.fileName,
    createdAt: report.createdAt,
    reportType: report.reportType,
    riskScore: report.riskScore,
    abnormalCount: report.structuredValues.filter((value) => value.status !== "Normal").length
  }));
