import { useEffect, useState } from "react";
import { Box, SxProps } from "@mui/material";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import useResponsive from "@common/hooks/useResponsive";
import useDatepickerShortcuts from "@common/hooks/useDatePickerShortcuts";

type Interface = {
  onChange: (args: DateValueType) => void;
  value: DateValueType;
  sx?: SxProps;
};

const DateRangePicker = ({ onChange, value, sx }: Interface) => {
  const { customShortcuts: shortcuts } = useDatepickerShortcuts();
  const { isMobile } = useResponsive();

  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [calendarPosition, setCalendarPosition] = useState<any>(undefined);

  const getCalenderPopoverDirection = () => {
    const element =
      typeof window !== "undefined" &&
      document.getElementById("custom-datepicker");

    if (element) {
      const { bottom } = calendarPosition || element.getBoundingClientRect();
      return windowHeight - bottom < 300 ? "up" : "down";
    }

    return "down";
  };

  useEffect(() => {
    const scrollEvent = () => {
      const element = document.getElementById("custom-datepicker");

      if (element) {
        setCalendarPosition(element.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", scrollEvent, true);

    return () => {
      window.removeEventListener("scroll", scrollEvent, true);
    };
  }, []);

  useEffect(() => {
    typeof window !== "undefined" && setWindowHeight(window.innerHeight);
  }, []);

  return (
    <Box id="custom-datepicker" sx={{ width: isMobile ? "100%" : 275, ...sx }}>
      <Datepicker
        useRange={!isMobile}
        value={value}
        configs={{ shortcuts }}
        onChange={onChange}
        showShortcuts={true}
        primaryColor={"blue"}
        popoverDirection={isMobile ? "down" : getCalenderPopoverDirection()}
        inputClassName="w-full rounded h-10 placeholder:text-sm focus:ring-0 font-normal border border-gray-400"
      />
    </Box>
  );
};

export default DateRangePicker;
