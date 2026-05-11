import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { fetchDashboard } from "../services/dashboardService";

const TrendLineChart = lazy(() => import("../components/charts/TrendLineChart"));

const DashboardPage = () => {
  const { data: dashboard, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard
  });

  return (
    <div>
      <PageHeader
        title="Health Dashboard"
        subtitle="See uploaded reports, abnormal values, alerts, and longitudinal health trends."
        action={
          <Link to="/upload-report" className="button-primary">
            Upload a report
          </Link>
        }
      />
      <DisclaimerBanner />
      {error ? <p className="text-sm text-red-600">{error.response?.data?.message || "Failed to load dashboard"}</p> : null}
      {!dashboard ? (
        <div className="card subtle-text">Loading dashboard...</div>
      ) : (
        <div className="space-y-6">
          <section className="hero-panel card grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="eyebrow">Live summary</p>
              <h2 className="section-title mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                One view for recent reports, risk level, and ongoing changes.
              </h2>
              <p className="mt-4 max-w-2xl subtle-text">
                Use this dashboard as your calm command center for uploads, abnormalities, comparison history, and AI-generated follow-up cues.
              </p>
            </div>
            <div className="dark-panel rounded-[28px] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Current snapshot</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Risk</p>
                  <p className="mt-2 text-3xl font-semibold">{dashboard.riskScore} score</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Alerts</p>
                  <p className="mt-2 text-lg font-semibold">{dashboard.totals.alerts}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Reports" value={dashboard.totals.reports} />
            <StatCard label="Prescriptions" value={dashboard.totals.prescriptions} />
            <StatCard label="Alerts" value={dashboard.totals.alerts} />
            <StatCard label="Pending" value={dashboard.totals.pendingReports} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Current Risk Score" value={`${dashboard.riskScore}%`} />
            <StatCard label="Latest Report Type" value={dashboard.latestReportType} />
          </div>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Recent uploads</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent Reports</h2>
              </div>
            </div>
            {dashboard.reports.length === 0 ? (
              <div className="card subtle-text">No reports uploaded yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {dashboard.reports.slice(0, 4).map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">Health Timeline</h2>
              <div className="mt-4 space-y-3">
                {dashboard.timeline.length === 0 ? (
                  <p className="subtle-text">Your parameter timeline will appear after uploads are processed.</p>
                ) : (
                  dashboard.timeline.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-white/80 bg-white/70 p-4 text-sm text-slate-700">
                      <p className="font-medium">
                        {item.parameter}: {item.value} {item.unit}
                      </p>
                      <p className="text-slate-600">
                        {new Date(item.measuredAt).toLocaleDateString()} | {item.reportType} | {item.status}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">Multi-Report Comparison</h2>
              <div className="mt-4 space-y-3">
                {dashboard.comparisons.length === 0 ? (
                  <p className="subtle-text">Upload reports to compare them over time.</p>
                ) : (
                  dashboard.comparisons.map((item) => (
                    <div key={item.reportId} className="rounded-3xl border border-white/80 bg-white/70 p-4 text-sm text-slate-700">
                      <p className="font-medium">{item.fileName}</p>
                      <p className="text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString()} | {item.reportType}
                      </p>
                      <p className="text-primary-700">
                        Risk score {item.riskScore}% | Abnormal values {item.abnormalCount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">Abnormal Values</h2>
              <div className="mt-4 space-y-3">
                {dashboard.abnormalValues.length === 0 ? (
                  <p className="subtle-text">No abnormal values detected yet.</p>
                ) : (
                  dashboard.abnormalValues.slice(0, 6).map((item, index) => (
                    <div key={`${item.parameter}-${index}`} className="rounded-3xl border border-white/80 bg-white/70 p-4">
                      <p className="font-medium">
                        {item.parameter}: {item.value} {item.unit}
                      </p>
                      <p className="text-sm text-slate-600">
                        Status: {item.status} | Normal range: {item.normalRange}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">Risk Factors</h2>
              <div className="mt-4 space-y-3">
                {dashboard.riskFactors.length === 0 ? (
                  <p className="subtle-text">No major risk factors identified from the latest completed report.</p>
                ) : (
                  dashboard.riskFactors.map((factor, index) => (
                    <div
                      key={`${factor}-${index}`}
                      className="rounded-3xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950"
                    >
                      {factor}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">Health Trends</h2>
              <div className="mt-4 space-y-4">
                {dashboard.trends.length === 0 ? (
                  <p className="subtle-text">Upload multiple reports to see trends.</p>
                ) : (
                  dashboard.trends.map((trend) => (
                    <div key={trend.parameter} className="rounded-3xl border border-white/80 bg-white/70 p-4">
                      <p className="font-medium">{trend.parameter}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {trend.points
                          .map((point) => `${new Date(point.measuredAt).getFullYear()}: ${point.value}`)
                          .join(" | ")}
                      </p>
                      <p className="mt-2 text-sm text-primary-700">{trend.insight}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="card hero-panel">
              <h2 className="text-lg font-semibold">AI Insights</h2>
              <div className="mt-4 space-y-3">
                {dashboard.insights.length === 0 ? (
                  <p className="subtle-text">
                    Insights will appear after more report history is available.
                  </p>
                ) : (
                  dashboard.insights.map((insight, index) => (
                    <div
                      key={`${insight}-${index}`}
                      className="rounded-3xl bg-primary-50/90 p-4 text-sm text-slate-700"
                    >
                      {insight}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Suspense fallback={<div className="card subtle-text">Loading charts...</div>}>
              {(dashboard.chartSeries || []).map((series) => (
                <TrendLineChart key={series.parameter} title={`${series.parameter} Trend`} points={series.points} />
              ))}
            </Suspense>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
