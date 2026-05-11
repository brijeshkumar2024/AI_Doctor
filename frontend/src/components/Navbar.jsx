import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";

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
  const navigate = useNavigate();

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
