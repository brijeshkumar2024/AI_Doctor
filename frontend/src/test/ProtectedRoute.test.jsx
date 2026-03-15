import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

vi.mock("../hooks/useAuth", () => ({
  default: () => ({
    user: null,
    loading: false
  })
}));

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login", () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard"]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ProtectedRoute>
          <div>Private content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });
});
