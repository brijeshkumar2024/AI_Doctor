import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import useAuth from "../hooks/useAuth";

const SignupPage = () => {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    medicalHistory: "",
    allergies: "",
    preferredLanguage: "en"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup({
        ...form,
        age: form.age ? Number(form.age) : undefined
      });
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (submitError) {
      const message = submitError.response?.data?.message || "Signup failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <section className="hero-panel card h-fit">
        <p className="eyebrow">New account</p>
        <h1 className="section-title mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
          Set up a clean, premium health workspace in minutes.
        </h1>
        <p className="mt-4 max-w-md subtle-text">
          Create your account once, then keep reports, prescriptions, language preferences, and AI guidance organized in one place.
        </p>
        <div className="mt-8 space-y-4">
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Thoughtful defaults</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Start simple now and fill in profile details only when they help later analysis.</p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Language-ready</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose your preferred interface language from the start.</p>
          </div>
        </div>
      </section>
      <div className="form-shell">
        <p className="eyebrow">Profile setup</p>
        <h2 className="section-title mt-3 text-4xl font-semibold tracking-[-0.03em]">{t("signup")}</h2>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormInput
            label={t("name")}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
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
          <FormInput
            label={t("age")}
            type="number"
            value={form.age}
            onChange={(event) => setForm({ ...form, age: event.target.value })}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t("gender")}</span>
            <select
              className="input"
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t("preferredLanguage")}</span>
            <select
              className="input"
              value={form.preferredLanguage}
              onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
            </select>
          </label>
          <FormInput
            label={t("height")}
            value={form.height}
            onChange={(event) => setForm({ ...form, height: event.target.value })}
          />
          <FormInput
            label={t("weight")}
            value={form.weight}
            onChange={(event) => setForm({ ...form, weight: event.target.value })}
          />
          <div className="md:col-span-2">
            <FormInput
              label={t("medicalHistory")}
              as="textarea"
              value={form.medicalHistory}
              onChange={(event) => setForm({ ...form, medicalHistory: event.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <FormInput
              label={t("allergies")}
              as="textarea"
              value={form.allergies}
              onChange={(event) => setForm({ ...form, allergies: event.target.value })}
            />
          </div>
          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
          <button type="submit" className="button-primary md:col-span-2" disabled={loading}>
            {loading ? t("loading") : t("signup")}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-700">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
