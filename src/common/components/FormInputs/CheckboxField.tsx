import React from "react";
import { FormControlLabel, Checkbox, CheckboxProps } from "@mui/material";

type PropsInterface = {
  label: string;
};

type CheckboxFieldProps = PropsInterface & CheckboxProps;

const CheckboxField = ({ label, ...otherProps }: CheckboxFieldProps) => {
  return (
    <FormControlLabel
      control={<Checkbox {...otherProps} />}
      label={label}
    />
  );
};

export default CheckboxField;
