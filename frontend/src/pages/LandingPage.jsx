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
    <div className="space-y-6">
      <section className="hero-panel card grid gap-8 overflow-hidden lg:grid-cols-[1.25fr_0.8fr]">
        <div className="relative">
          <div className="grid-fade absolute inset-y-0 right-[-18%] hidden w-[48%] rounded-full opacity-30 lg:block" />
          <p className="eyebrow relative z-10">AI healthcare support</p>
          <h1 className="section-title relative z-10 mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-900 md:text-6xl">
            Calm, private health guidance with a simpler clinical workspace.
          </h1>
          <p className="relative z-10 mt-5 max-w-2xl text-base leading-8 text-slate-600">{t("welcomeSubtitle")}</p>
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
          <Link to="/signup" className="button-primary">
            {t("signup")}
          </Link>
          <Link to="/login" className="button-secondary">
            {t("login")}
          </Link>
          </div>
          <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Report insight</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">OCR plus AI summaries</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Language aware</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">English, Hindi, Bengali</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Guided follow-up</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">Risk flags and trends</p>
            </div>
          </div>
        </div>
        <section className="dark-panel rounded-[30px] p-6 text-white shadow-soft md:p-7">
          <p className="eyebrow text-white/70">Included</p>
          <h2 className="section-title mt-3 text-3xl font-semibold tracking-[-0.03em]">A focused care companion</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-white/80">
            <li>Secure account creation with profile-based personalization.</li>
            <li>Medical report upload, extraction, alerts, and report history.</li>
            <li>Prescription explanation, symptom guidance, and AI chat support.</li>
            <li>Dashboard views for abnormal values, trends, and risk signals.</li>
          </ul>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Design note</p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Built to feel reassuring and premium, without adding clutter.
            </p>
          </div>
        </section>
      </section>
    </div>
  );
};

export default LandingPage;
