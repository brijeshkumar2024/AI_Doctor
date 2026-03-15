import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import PageHeader from "../components/PageHeader";
import PDFPreview from "../components/PDFPreview";
import { fetchSharedReport } from "../services/reportService";

const SharedReportPage = () => {
  const { token } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setReport(await fetchSharedReport(token));
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Could not load shared report");
      }
    };

    loadReport();
  }, [token]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared Health Report"
        subtitle="Read-only shared view of report findings and AI explanations."
      />
      <DisclaimerBanner />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!report ? (
        <p className="text-slate-600">Loading shared report...</p>
      ) : (
        <>
          <div className="card">
            <h2 className="text-lg font-semibold">{report.fileName}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {report.reportType} | Uploaded on {new Date(report.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-primary-700">Risk score: {report.riskScore}%</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold">Report Preview</h2>
            <div className="mt-4">
              {report.fileType === "pdf" ? (
                <PDFPreview fileUrl={report.fileUrl} />
              ) : (
                <img src={report.fileUrl} alt={report.fileName} className="max-h-[36rem] rounded-lg border border-slate-200 object-contain" />
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-semibold">Structured Values</h2>
              <div className="mt-4 space-y-3">
                {(report.structuredValues || []).map((item) => (
                  <div key={item.parameter} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-medium">
                      {item.parameter}: {item.value} {item.unit}
                    </p>
                    <p>Status: {item.status}</p>
                    <p>Reference range: {item.normalRange}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="mt-3 text-slate-700">{report.aiAnalysis?.summary}</p>
              <div className="mt-4 space-y-3">
                {(report.doctorSummary || []).map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-lg bg-primary-50 p-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SharedReportPage;
