import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition duration-200",
    isActive
      ? "bg-primary-700 text-white shadow-[0_10px_24px_rgba(28,71,66,0.18)]"
      : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
  ].join(" ");

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const { data: trendsSummary } = useQuery({
    queryKey: ["trends", "summary"],
    queryFn: async () => {
      const response = await fetch("/api/trends/summary");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const hasWorseningTrends = trendsSummary?.data?.summary?.some(item => item.trend.direction === "worsening");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="nav-shell mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-sm font-bold text-white shadow-[0_14px_28px_rgba(28,71,66,0.24)]">
            AI
          </span>
          <span>
            <span className="eyebrow block">Private Health OS</span>
            <span className="mt-1 block text-base font-semibold text-slate-900">{t("appName")}</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              {/* Connection status indicator */}
              {isConnected ? (
                <div
                  title="Real-time updates enabled"
                  className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                >
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                  Live
                </div>
              ) : (
                <div
                  title="Reconnecting..."
                  className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-600"></span>
                  Reconnecting
                </div>
              )}
              
              <NavLink to="/dashboard" className={navLinkClass}>
                {t("dashboard")}
              </NavLink>
              <NavLink to="/upload-report" className={navLinkClass}>
                {t("uploadReport")}
              </NavLink>
              <NavLink to="/prescriptions" className={navLinkClass}>
                {t("prescriptionUpload")}
              </NavLink>
              <NavLink to="/symptoms" className={navLinkClass}>
                {t("symptomChecker")}
              </NavLink>
              <NavLink to="/trends" className={`${navLinkClass} relative`}>
                Health Trends
                {hasWorseningTrends && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                {t("chatAssistant")}
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                {t("profile")}
              </NavLink>
              <button type="button" className="button-secondary" onClick={handleLogout}>
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                {t("login")}
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                {t("signup")}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
