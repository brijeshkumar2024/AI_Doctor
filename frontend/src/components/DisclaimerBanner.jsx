import { useTranslation } from "react-i18next";

const DisclaimerBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {t("disclaimer")}
    </div>
  );
};

export default DisclaimerBanner;

