import { InputProps } from "@mui/material";
import { SelectInputProps } from "@mui/material/Select/SelectInput";

export interface ISelectInputOption {
  value?: string | number;
  label?: string;
}

export interface InputSelectProps {
  onChange?: SelectInputProps<string>["onChange"];
  value?: string;
  labelText?: string;
  labelFor?: string;
  id?: string;
  name?: string;
  type?: string;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: string | any;
  readOnly?: boolean;
  disabled?: boolean;
  options?: ISelectInputOption[];
  defaultValue?: string;
  displayEmpty?: boolean;
  inputProps?: InputProps["inputProps"];
}
