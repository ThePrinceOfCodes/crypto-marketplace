import { ReactNode } from "react";

export type TimezoneContextType = {
  timezone: string;
  changeTimezone: (timezone: string) => void;
};

export interface TimezoneProviderProps {
  children: ReactNode;
}
