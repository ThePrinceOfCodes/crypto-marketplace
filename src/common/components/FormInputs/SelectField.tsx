import React from "react";
import {
  Select,
  FormControl,
  SelectProps,
  InputLabel,
  FormHelperText,
  MenuItem,
} from "@mui/material";

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 250,
      overflow: "auto",
    },
  },
};

type AdditionalProps = {
  options?: { value: string | number; label: string }[];
  children?: React.ReactNode;
  helperText?: string | boolean;
};

type PropsInterface = SelectProps & AdditionalProps;

const SelectField = (props: PropsInterface) => {
  const {
    size: inputSize,
    label,
    error,
    options = [],
    helperText,
    children,
    multiple = false,
    ...otherProps
  } = props;

  const size = inputSize || "small";

  return (
    <FormControl size={size} fullWidth error={error}>
      <InputLabel id={`input-label-id-${label}`}>{label}</InputLabel>
      <Select
        labelId={`input-label-id-${label}`}
        fullWidth
        size={size}
        label={label}
        multiple={multiple}
        MenuProps={MenuProps}
        sx={{
          height: 44,
        }}
        {...otherProps}
      >
        {options.length > 0
          ? options.map((option) => (
            <MenuItem key={option.value} value={option.value} aria-label={option.label}>
              {option.label}
            </MenuItem>
          ))
          : children}
      </Select>
      {helperText && (
        <FormHelperText sx={{ ml: 0.5 }}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default SelectField;
