import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import { updateProfile } from "../services/profileService";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    medicalHistory: "",
    allergies: "",
    preferredLanguage: "en"
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        age: user.age || "",
        gender: user.gender || "",
        height: user.height || "",
        weight: user.weight || "",
        medicalHistory: user.medicalHistory || "",
        allergies: user.allergies || "",
        preferredLanguage: user.preferredLanguage || "en"
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const updatedUser = await updateProfile({
        ...form,
        age: form.age ? Number(form.age) : undefined
      });
      setUser((previousUser) => ({ ...(previousUser || {}), ...updatedUser }));
      setStatus("Profile updated successfully.");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Could not update profile");
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={t("profile")}
        subtitle="Update personal details used across reports, language support, and dashboard context."
        action={
          <Link to="/settings/language" className="button-secondary">
            {t("languageSettings")}
          </Link>
        }
      />
      <form className="card grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
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
          label={t("age")}
          type="number"
          value={form.age}
          onChange={(event) => setForm({ ...form, age: event.target.value })}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t("gender")}</span>
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
        {status ? <p className="text-sm text-green-600 md:col-span-2">{status}</p> : null}
        {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
        <button type="submit" className="button-primary md:col-span-2">
          {t("save")}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;

