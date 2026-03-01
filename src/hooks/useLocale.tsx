import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "pt" | "es";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "pt",
  setLocale: () => {},
});

function detectBrowserLocale(): Locale {
  const saved = localStorage.getItem("app_locale");
  if (saved === "pt" || saved === "es") return saved;

  const lang = navigator.language || (navigator as any).userLanguage || "pt";
  if (lang.startsWith("es")) return "es";
  return "pt";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectBrowserLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("app_locale", l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  return useContext(I18nContext);
}
