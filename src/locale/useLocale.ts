import { LocaleContext } from "@common/context";
import { useContext } from "react";

function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) {
    throw Error("useLocale only be called inside locale provider!");
  }

  return value;
}

export default useLocale;
