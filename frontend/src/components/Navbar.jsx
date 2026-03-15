import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm ${isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`;

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link to={user ? "/dashboard" : "/"} className="text-lg font-semibold text-slate-900">
          {t("appName")}
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
