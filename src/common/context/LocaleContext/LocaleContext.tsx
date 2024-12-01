import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LocaleContextType, LocaleProviderProps } from "./types";
import { AllLocalKeys, LocalKeys, LocalsType, resources } from "locale";
import { useAuth } from "../AuthContext";

const LocaleContext = createContext<LocaleContextType | null>(null);

function LocaleProvider({ children }: LocaleProviderProps) {
  const { user } = useAuth();
  const [locale, setLocale] = useState<LocalsType>("en_US");

  useEffect(() => {
    if (user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLocale(JSON?.parse((user as any)?.language)?.language);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // console.log('Error: ', err.message)
      }
    }
  }, [user]);

  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources,
      lng: locale,

      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });

  const changeLocale = async (_locale: LocalsType) => {
    setLocale(_locale);
    i18n.changeLanguage(_locale);
  };

  const text = useCallback(
    (type: LocalKeys | string, options?: { locale: LocalsType }) => {
      const targetLocale = options?.locale || locale;
      if (options?.locale) {
        return resources?.[targetLocale].translation[type as AllLocalKeys]
          ? i18n.t(type, { lng: targetLocale })
          : type;
      }
      return resources?.en_US.translation[type as LocalKeys]
        ? i18n.t(type)
        : type;
    },
    [locale],
  );

  const textToKey = useCallback((text: string) => {
    const localeKeys = Object.keys(resources.en_US.translation) as LocalKeys[];
    const foundKey = localeKeys.find(
      (key) => resources.en_US.translation[key] === text,
    );
    return foundKey as LocalKeys;
  }, []);

  const value = useMemo(
    () => ({
      changeLocale,
      locale,
      text,
      textToKey,
    }),
    [locale, text, textToKey],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export { LocaleProvider, LocaleContext };
