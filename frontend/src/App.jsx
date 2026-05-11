import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import UploadReportPage from "./pages/UploadReportPage";
import ReportAnalysisPage from "./pages/ReportAnalysisPage";
import PrescriptionUploadPage from "./pages/PrescriptionUploadPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";
import ChatAssistantPage from "./pages/ChatAssistantPage";
import ProfilePage from "./pages/ProfilePage";
import LanguageSettingsPage from "./pages/LanguageSettingsPage";
import HealthTrends from "./pages/HealthTrends";
import NotFoundPage from "./pages/NotFoundPage";
import SharedReportPage from "./pages/SharedReportPage";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/shared-report/:token" element={<SharedReportPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-report"
        element={
          <ProtectedRoute>
            <UploadReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <ReportAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute>
            <PrescriptionUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/symptoms"
        element={
          <ProtectedRoute>
            <SymptomCheckerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trends"
        element={
          <ProtectedRoute>
            <HealthTrends />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatAssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/language"
        element={
          <ProtectedRoute>
            <LanguageSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/report-analysis" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Layout>
);

export default App;
