import en_US from "./en.json";
import ko_KR from "./ko.json";

export type LocalKeys = keyof typeof en_US.translation;
export type AllLocalKeys = keyof typeof en_US.translation &
  keyof typeof ko_KR.translation;

export type LocalsType = "en_US" | "ko_KR";

export const ServerLocalTypes = {
  en_US: "en",
  ko_KR: "kr",
};

export const resources = {
  ko_KR,
  en_US,
};

export enum LocaleEnum {
  en_US = "en_US",
  ko_KR = "ko_KR",
}

export { default as useLocale } from "./useLocale";
