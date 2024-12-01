import React, { useState } from "react";
import {
  TextField,
  TextFieldProps,
  FormControl,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const TextFieldInput = (props: TextFieldProps) => {
  const { size: inputSize, value, variant, type, sx, label, ...otherProps } = props;

  const size = inputSize || "small";

  const [showPassword, setshowPassword] = useState(false);

  const handleClickShowPassword = () => setshowPassword(!showPassword);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
  };

  return (
    <FormControl fullWidth>
      <TextField
        label={label}
        fullWidth
        size={size}
        variant={variant ?? "outlined"}
        type={type === "password" && showPassword ? "text" : type}
        InputLabelProps={{ size: "small" }}
        value={value}
        sx={{
          ...sx,
          "& .MuiInputBase-input:focus": {
            boxShadow: "none",
          },
          ".MuiInputLabel-root": {
            top: 1,
          },
          ".MuiFormHelperText-root": {
            marginLeft: 0.5
          }
        }}
        inputProps={{
          style: {
            height: "28px",
          },
        }}
        InputProps={{
          endAdornment:
            type === "password" ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ) : null,
        }}
        {...otherProps}
      />
    </FormControl>
  );
};

export default TextFieldInput;
