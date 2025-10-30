import { I18n } from "i18n-js";
import * as RNLocalize from "react-native-localize";
import en from "../locales/en.json";
import es from "../locales/es.json";
import te from "../locales/te.json";

// 1. Create your own I18n instance:
const i18n = new I18n({
  en,
  es,
  te,
});
i18n.fallbacks = true;

export function setI18nConfig(langCode?: string): void {
  const locales = RNLocalize.getLocales();
  i18n.locale = langCode || (locales && locales.length > 0 ? locales[0].languageTag : "en");
}

export default i18n;
