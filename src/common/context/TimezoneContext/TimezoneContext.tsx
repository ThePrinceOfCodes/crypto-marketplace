import React, {
    createContext,
    useEffect,
    useMemo,
    useState,
  } from "react";
import { TimezoneContextType, TimezoneProviderProps } from "./types";
  
  const TimezoneContext = createContext<TimezoneContextType | null>(null);
  
  function TimezoneProvider({ children }: TimezoneProviderProps) {
    const [timezone, setTimezone] = useState<string>("Asia/Seoul");

    useEffect(() => {
      const _timezone = localStorage.getItem("timezone");
      if (_timezone) {
        setTimezone(_timezone);
      }
    }
    , []);

    const changeTimezone = async (_timezone: string) => {
      setTimezone(_timezone);
      localStorage.setItem("timezone", _timezone);
    };
  
    const value = useMemo(
      () => ({
        changeTimezone,
        timezone,
      }),
      [timezone],
    );
  
    return (
      <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
    );
  }
  
  export { TimezoneProvider, TimezoneContext };
  