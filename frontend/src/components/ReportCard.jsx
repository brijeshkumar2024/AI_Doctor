import { Link } from "react-router-dom";

const ReportCard = ({ report }) => (
  <div className="card hero-panel">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="pill">{report.reportType || "General Lab Report"}</span>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{report.fileName}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Link className="button-secondary" to={`/reports/${report._id}`}>
        View
      </Link>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-white/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
        <p className="mt-2 text-sm font-semibold text-slate-800">{report.processingStatus || "completed"}</p>
      </div>
      <div className="rounded-2xl bg-white/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Abnormal</p>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {report.structuredValues.filter((value) => value.status !== "Normal").length}
        </p>
      </div>
      <div className="rounded-2xl bg-primary-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700/70">Risk score</p>
        <p className="mt-2 text-sm font-semibold text-primary-700">{report.riskScore || 0}%</p>
      </div>
    </div>
  </div>
);

export default ReportCard;
