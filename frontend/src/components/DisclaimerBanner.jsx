import { useTranslation } from "react-i18next";

const DisclaimerBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="info-banner mb-6">
      {t("disclaimer")}
    </div>
  );
};

export default DisclaimerBanner;
