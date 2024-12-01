import React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { FormControl } from "@mui/material";
import { Dayjs } from "dayjs";

type AdditionalProps = {
  label?: string; // Add label prop
  onBlur?: (args: any) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  value?: Dayjs | null;
};

type Interface = AdditionalProps & DatePickerProps<Dayjs>;

const DatesField = (props: Interface) => {
  const { label, value, onBlur, error, helperText, ...otherProps } = props;

  return (
    <FormControl size="small" fullWidth>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value}
          slotProps={{
            textField: {
              size: "small",
              inputProps: { style: { height: "28px" } },
              error: error,
              helperText: helperText,
              onBlur: onBlur,
              label: label,
            },
          }}
          sx={{
            ".MuiInputLabel-root": {
              top: 1,
            },
            "& .MuiInputBase-input:focus": {
              boxShadow: "none",
            },
            "& .MuiInputBase": {
              border: "1px solid red",
            },
            ".MuiFormHelperText-root": {
              marginLeft: 0.5,
            },
          }}
          {...otherProps}
        />
      </LocalizationProvider>
    </FormControl>
  );
};

export default DatesField;
