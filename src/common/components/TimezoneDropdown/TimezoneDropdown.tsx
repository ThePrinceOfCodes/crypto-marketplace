import React from "react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import { useTimezone } from "@common/hooks";
import { toast } from "react-toastify";
import { useLocale } from "locale";

const timezones = {
  ...allTimezones,
  "Europe/Berlin": "Frankfurt",
};

interface ITimezoneDropdownProps {
  className?: string;
}

const TimezoneDropdown = (props: ITimezoneDropdownProps) => {
  const { className } = props;
  const { timezone, changeTimezone } = useTimezone();
  const { text } = useLocale();
  const labelStyle = "original";

  const { options } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  const handleOnChangeTimezone = (e: SelectChangeEvent) => {
    if (changeTimezone) {
      changeTimezone(e.target.value);
      toast(text("setting_users_timezone_successfully"), {
        type: "success",
      });
    }
  };

  return (
    <Select
      className={`bg-gray-50 h-10 w-60 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 ${className}`}
      required
      displayEmpty
      value={timezone}
      inputProps={{ "aria-label": "Without label" }}
      onChange={handleOnChangeTimezone}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option.value}>
          <em>{option.label}</em>
        </MenuItem>
      ))}
    </Select>
  );
};

export default TimezoneDropdown;
