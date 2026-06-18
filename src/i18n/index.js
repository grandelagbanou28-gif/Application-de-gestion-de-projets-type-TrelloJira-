import {useSelector} from "react-redux";
import fr from "./fr";
import en from "./en";
const translations = {
  fr,
  en
};
export function useTranslation() {
  const lang = useSelector(state => state.language.lang);
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) {
      if (value) value = value[k];
    }
    if (typeof value === "string") {
      return value.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? `{${p}}`);
    }
    const fallbackKey = key + "_plural";
    const fallbackKeys = fallbackKey.split(".");
    let fallbackValue = translations[lang];
    for (const k of fallbackKeys) {
      if (fallbackValue) fallbackValue = fallbackValue[k];
    }
    if (typeof fallbackValue === "string") {
      return fallbackValue.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? `{${p}}`);
    }
    return key;
  };
  return {
    t,
    lang
  };
}
