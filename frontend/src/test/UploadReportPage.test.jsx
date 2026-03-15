import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UploadReportPage from "../pages/UploadReportPage";

const { mockNavigate, mockUploadReport } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUploadReport: vi.fn(async () => ({
    queued: false,
    report: { _id: "report-1" }
  }))
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("../services/reportService", () => ({
  uploadReport: mockUploadReport
}));

describe("UploadReportPage", () => {
  it("uploads a selected report", async () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <UploadReportPage />
      </MemoryRouter>
    );

    const file = new File(["report"], "report.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/report file/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /upload and analyze/i }));

    await waitFor(() => expect(mockUploadReport).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/reports/report-1");
  });
});
