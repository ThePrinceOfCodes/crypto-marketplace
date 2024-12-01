import React from "react";
import { Autocomplete, AutocompleteProps, TextField } from "@mui/material";

type AdditionalProps = {
  label?: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
type PropsInterface = AdditionalProps & AutocompleteProps;

const AutoCompleteField = (props: PropsInterface) => {
  const { label, error, helperText, placeholder,  ...otherProps } = props;

  return (
    <Autocomplete
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          sx={{
            "& .MuiInputBase-input:focus": {
              boxShadow: "none",
            },
            "& .MuiInputBase-root": {
              minHeight: "44px",
            },
            ".MuiFormHelperText-root": {
              marginLeft: 0.5,
            },
            ".MuiInputLabel-root": {
              top: 1,
            },
          }}
          label={label}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          {...params}
        />
      )}
      {...otherProps}
    />
  );
};

export default AutoCompleteField;
