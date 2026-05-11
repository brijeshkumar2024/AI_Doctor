import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (submitError) {
      const message = submitError.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="dark-panel hidden rounded-[34px] p-8 text-white shadow-soft lg:block">
        <p className="eyebrow text-white/60">Welcome back</p>
        <h1 className="section-title mt-4 text-5xl font-semibold leading-tight tracking-[-0.04em]">
          Your reports, trends, and care notes in one quiet place.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{t("tagline")}</p>
        <div className="mt-10 space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold">Private by default</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Review uploads, profile settings, and AI support without visual noise.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold">Fast daily use</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Jump back into dashboard, reports, symptoms, and chat in a few clicks.</p>
          </div>
        </div>
      </section>
      <div className="form-shell">
        <p className="eyebrow">Account access</p>
        <h1 className="section-title mt-3 text-4xl font-semibold tracking-[-0.03em]">{t("login")}</h1>
        <p className="mt-3 subtle-text">{t("tagline")}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
        <p className="mt-6 text-sm text-slate-600">
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
