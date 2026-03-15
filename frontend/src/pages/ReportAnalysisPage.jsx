import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import PageHeader from "../components/PageHeader";
import { createShareLink, fetchReportById, getReportExportUrl } from "../services/reportService";
import PDFPreview from "../components/PDFPreview";

const ReportAnalysisPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const nextReport = await fetchReportById(id);
        setReport(nextReport);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Failed to load report");
      }
    };

    loadReport();

    if (!["pending", "processing"].includes(report?.processingStatus || "completed")) {
      return undefined;
    }

    const intervalId = window.setInterval(loadReport, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, report?.processingStatus]);

  const exportUrl = useMemo(() => (report ? getReportExportUrl(report._id) : ""), [report]);

  const handleShare = async () => {
    try {
      const data = await createShareLink(id);
      await navigator.clipboard.writeText(data.shareUrl);
      setShareMessage(`Share link copied. Expires on ${new Date(data.expiresAt).toLocaleString()}.`);
    } catch (shareError) {
      setShareMessage(shareError.response?.data?.message || "Could not create share link.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Report Analysis"
        subtitle="Extracted report values, alerts, AI explanations, and timeline insights."
        action={
          report?.fileUrl ? (
            <div className="flex flex-wrap gap-2">
              <a href={report.fileUrl} target="_blank" rel="noreferrer" className="button-secondary">
                Open Original File
              </a>
              {report.processingStatus === "completed" ? (
                <>
                  <button type="button" onClick={handleShare} className="button-secondary">
                    Share Link
                  </button>
                  <a href={exportUrl} className="button-secondary">
                    Export PDF
                  </a>
                </>
              ) : null}
            </div>
          ) : null
        }
      />
      <DisclaimerBanner />
      {shareMessage ? <p className="mb-3 text-sm text-primary-700">{shareMessage}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!report ? (
        <div className="text-slate-600">Loading report...</div>
      ) : (
        <div className="space-y-6">
          <section className="card">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{report.fileName}</h2>
                <p className="text-sm text-slate-500">
                  Uploaded on {new Date(report.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-600">Report type: {report.reportType}</p>
                <p className="text-sm text-primary-700">Risk score: {report.riskScore}%</p>
                <p className="text-sm text-slate-600">
                  Processing status: {report.processingStatus || "completed"}
                </p>
                {report.processingError ? (
                  <p className="text-sm text-red-600">Processing error: {report.processingError}</p>
                ) : null}
              </div>
              <Link to="/dashboard" className="button-secondary">
                Back to Dashboard
              </Link>
            </div>
            {["pending", "processing"].includes(report.processingStatus) ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                Analysis is still running in the background. This page refreshes automatically.
              </div>
            ) : null}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Report Preview</h2>
            <div className="mt-4">
              {report.fileType === "pdf" ? (
                <PDFPreview fileUrl={report.fileUrl} />
              ) : (
                <img
                  src={report.fileUrl}
                  alt={report.fileName}
                  className="max-h-[36rem] rounded-lg border border-slate-200 object-contain"
                />
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Structured Values</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Parameter</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Range</th>
                    <th className="px-3 py-2">Warning</th>
                  </tr>
                </thead>
                <tbody>
                  {report.structuredValues.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3 text-slate-600" colSpan="5">
                        No known medical values could be extracted from this file yet.
                      </td>
                    </tr>
                  ) : (
                    report.structuredValues.map((item) => (
                      <tr key={item.parameter} className="border-t border-slate-200">
                        <td className="px-3 py-3">{item.parameter}</td>
                        <td className="px-3 py-3">
                          {item.value} {item.unit}
                        </td>
                        <td className="px-3 py-3">{item.status}</td>
                        <td className="px-3 py-3">{item.normalRange}</td>
                        <td className="px-3 py-3 text-amber-900">{item.warning || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Parser confidence: {Math.round((report.parserMetadata?.averageConfidence || 0) * 100)}%
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-semibold">AI Summary</h2>
              <p className="mt-3 text-slate-700">{report.aiAnalysis.summary}</p>
              <div className="mt-4 space-y-3">
                <h3 className="font-medium">Abnormal Findings</h3>
                {report.aiAnalysis.abnormalFindings.length === 0 ? (
                  <p className="text-slate-600">No abnormal findings were highlighted.</p>
                ) : (
                  report.aiAnalysis.abnormalFindings.map((finding, index) => (
                    <div key={`${finding}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      {finding}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="font-medium">Abnormal Explanations</h3>
                {(report.aiAnalysis.abnormalExplanations || []).map((reason, index) => (
                  <div key={`${reason}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {reason}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="font-medium">Possible Reasons</h3>
                {(report.aiAnalysis.possibleReasons || []).map((reason, index) => (
                  <div key={`${reason}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2 className="text-lg font-semibold">Doctor-Style Summary</h2>
              <div className="mt-4 space-y-3">
                {(report.doctorSummary || []).map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-lg bg-primary-50 p-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <h3 className="font-medium">Recommendations</h3>
                <div className="mt-3 space-y-3">
                  {(report.aiAnalysis.recommendations || []).map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-lg bg-primary-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="font-medium">Risk Factors</h3>
                <div className="mt-3 space-y-3">
                  {(report.riskFactors || []).map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="font-medium">Timeline Summary</h3>
                <div className="mt-3 space-y-3">
                  {(report.timelineSummary || []).map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="font-medium">Extracted OCR Text</h3>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  {report.cleanedText || report.extractedText || "No OCR text available."}
                </pre>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ReportAnalysisPage;
