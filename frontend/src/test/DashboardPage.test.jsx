import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";

vi.mock("../services/dashboardService", () => ({
  fetchDashboard: vi.fn(async () => ({
    totals: { reports: 1, prescriptions: 0, alerts: 1, pendingReports: 0 },
    reports: [],
    abnormalValues: [],
    alerts: ["Critical value detected"],
    prescriptions: [],
    trends: [],
    chartSeries: [],
    timeline: [],
    comparisons: [],
    riskScore: 52,
    riskFactors: [],
    latestReportType: "CBC Report",
    insights: []
  }))
}));

describe("DashboardPage", () => {
  it("renders the dashboard summary", async () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Health Dashboard/i)).toBeInTheDocument());
    expect(screen.getByText(/CBC Report/i)).toBeInTheDocument();
    expect(screen.getByText(/52%/i)).toBeInTheDocument();
  });
});
