import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../components/FormInput";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-semibold">{t("login")}</h1>
        <p className="mt-2 text-slate-600">{t("tagline")}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label={t("email")}
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <FormInput
            label={t("password")}
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" className="button-primary w-full" disabled={loading}>
            {loading ? t("loading") : t("login")}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary-700">
            {t("signup")}
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <Link to="/forgot-password" className="font-medium text-primary-700">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
