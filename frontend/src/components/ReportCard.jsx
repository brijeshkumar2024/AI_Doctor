import { Link } from "react-router-dom";

const ReportCard = ({ report }) => (
  <div className="card">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-slate-900">{report.fileName}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Link className="button-secondary" to={`/reports/${report._id}`}>
        View
      </Link>
    </div>
    <p className="mt-3 text-sm text-slate-600">
      Status: {report.processingStatus || "completed"}
    </p>
    <p className="mt-3 text-sm text-slate-600">
      Abnormal values: {report.structuredValues.filter((value) => value.status !== "Normal").length}
    </p>
    <p className="mt-1 text-sm text-slate-600">Report type: {report.reportType || "General Lab Report"}</p>
    <p className="mt-1 text-sm text-primary-700">Risk score: {report.riskScore || 0}%</p>
  </div>
);

export default ReportCard;
