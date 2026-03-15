import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./translations/en.json";
import hi from "./translations/hi.json";
import bn from "./translations/bn.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;

