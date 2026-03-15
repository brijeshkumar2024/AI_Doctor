import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";

const LandingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
      <section className="card">
        <p className="text-sm font-medium uppercase tracking-wide text-primary-700">AI healthcare support</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{t("welcomeTitle")}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{t("welcomeSubtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup" className="button-primary">
            {t("signup")}
          </Link>
          <Link to="/login" className="button-secondary">
            {t("login")}
          </Link>
        </div>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold text-slate-900">Features</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>Secure account creation and profile-based language preference.</li>
          <li>Medical report upload with OCR, smart value extraction, and alerts.</li>
          <li>Prescription explanation, symptom checker, and AI health chat.</li>
          <li>Health dashboard with history, abnormal values, and simple trends.</li>
        </ul>
      </section>
    </div>
  );
};

export default LandingPage;

