import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DisclaimerBanner from "../components/DisclaimerBanner";
import PageHeader from "../components/PageHeader";
import {
  fetchReportById,
  fetchReportComparison,
  getReportExportUrl
} from "../services/reportService";
import PDFPreview from "../components/PDFPreview";
import ModelComparison from "../components/ModelComparison";
import ComparisonHighlights from "../components/ComparisonHighlights";
import ShareReportModal from "../components/ShareReportModal";
import ReportStatusTracker from "../components/ReportStatusTracker";
import { useReportStatus } from "../hooks/useReportStatus";

const ReportAnalysisPage = () => {
  const { id } = useParams();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const { data: report, error } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReportById(id)
  });
  
  // Use socket-powered status tracking instead of polling
  const { status, stage, stageMessage, queuePosition, isLive } = useReportStatus(
    id,
    report?.processingStatus || "pending"
  );

  const { data: comparisonData } = useQuery({
    queryKey: ["report-comparison", id],
    queryFn: () => fetchReportComparison(id),
    enabled: Boolean(report?._id) && status === 'completed'
  });

  const { data: shareLinks } = useQuery({
    queryKey: ["shareLinks", id],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${id}/shares`);
      if (!response.ok) throw new Error("Failed to fetch share links");
      return response.json();
    },
    enabled: Boolean(report?._id)
  });

  const exportUrl = useMemo(() => (report ? getReportExportUrl(report._id) : ""), [report]);
  const handlePrint = () => {
    window.print();
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
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="button-secondary"
                  >
                    Share with Doctor
                  </button>
                  <a href={exportUrl} className="button-secondary">
                    Export PDF
                  </a>
                  <button type="button" onClick={handlePrint} className="button-secondary">
                    Download Report as PDF
                  </button>
                </>
              ) : null}
            </div>
          ) : null
        }
      />
      <DisclaimerBanner />
      {error ? <p className="text-sm text-red-600">{error.response?.data?.message || "Failed to load report"}</p> : null}
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
            {["pending", "processing", "queued"].includes(status) ? (
              <ReportStatusTracker
                status={status}
                stage={stage}
                stageMessage={stageMessage}
                queuePosition={queuePosition}
                isLive={isLive}
              />
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

          <ComparisonHighlights comparison={comparisonData?.comparison || {}} />

          <ModelComparison
            gemini={comparisonData?.gemini || report.aiAnalysis?.gemini}
            groq={comparisonData?.groq || report.aiAnalysis?.groq}
          />

          {shareLinks?.data?.length > 0 && (
            <section className="card">
              <h2 className="text-lg font-semibold">Active Share Links</h2>
              <div className="mt-4 space-y-3">
                {shareLinks.data.map((link) => (
                  <div key={link.token} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Expires: {new Date(link.expiresAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            link.isRevoked
                              ? "bg-red-100 text-red-800"
                              : link.accessCount >= link.maxAccess
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {link.isRevoked
                              ? "Revoked"
                              : link.accessCount >= link.maxAccess
                              ? "Max views reached"
                              : "Active"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Views: {link.accessCount} / {link.maxAccess === 100 ? "∞" : link.maxAccess}
                        </div>
                        {link.doctorNote && (
                          <div className="text-sm text-gray-700 mt-1">
                            <strong>Note:</strong> {link.doctorNote}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared/${link.token}`)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Copy Link
                        </button>
                        {!link.isRevoked && link.accessCount < link.maxAccess && (
                          <button
                            onClick={() => {
                              if (window.confirm("Revoke this share link?")) {
                                // Revoke logic would go here, but since we have the modal, maybe redirect to modal
                                setShowShareModal(true);
                              }
                            }}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Raw OCR Text</h2>
              <button
                type="button"
                onClick={() => setShowRawOcr((value) => !value)}
                className="button-secondary"
              >
                {showRawOcr ? "Hide" : "Show Raw OCR Text"}
              </button>
            </div>
            {showRawOcr ? (
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                {report.cleanedText || report.extractedText || "No OCR text available."}
              </pre>
            ) : null}
          </section>
        </div>
      )}

      <ShareReportModal
        reportId={id}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default ReportAnalysisPage;
