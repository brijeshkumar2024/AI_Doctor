import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import useAuth from "../hooks/useAuth";
import { updateLanguage } from "../services/profileService";

const LanguageSettingsPage = () => {
  const { i18n, t } = useTranslation();
  const { user, setUser } = useAuth();
  const [language, setLanguage] = useState(user?.preferredLanguage || "en");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setStatus("");
    setError("");

    try {
      const updatedUser = await updateLanguage(language);
      setUser((previousUser) => ({ ...(previousUser || {}), ...updatedUser }));
      localStorage.setItem("language", language);
      await i18n.changeLanguage(language);
      setStatus("Language updated.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not update language");
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title={t("languageSettings")}
        subtitle="Choose your preferred interface language and AI response language."
      />
      <div className="card space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t("preferredLanguage")}</span>
          <select
            className="input"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
          </select>
        </label>
        {status ? <p className="text-sm text-green-600">{status}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="button" className="button-primary" onClick={handleSave}>
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default LanguageSettingsPage;

