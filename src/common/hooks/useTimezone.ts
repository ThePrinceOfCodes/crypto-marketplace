import { TimezoneContext } from "@common/context/TimezoneContext";
import { useContext } from "react";

export const useTimezone = () => {
    const currentTimezone  = useContext(TimezoneContext);
  return {
    ...currentTimezone
  };
};