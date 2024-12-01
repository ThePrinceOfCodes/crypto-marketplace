import { ReactNode } from "react";
import { LocalKeys, LocalsType } from "locale";

export type LocaleContextType = {
  text: (id: LocalKeys, options?: { locale: LocalsType }) => string;
  textToKey: (text: string) => LocalKeys;
  locale: LocalsType;
  changeLocale: (locale: LocalsType) => void;
};

export interface LocaleProviderProps {
  children: ReactNode;
}
