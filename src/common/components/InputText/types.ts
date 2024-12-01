import { ChangeEventHandler } from "react";

export interface InputProps {
  onChange?: ChangeEventHandler;
  value?: string | number;
  labelText?: string;
  labelFor?: string;
  id?: string;
  name?: string;
  type?: string;
  isRequired?: boolean;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: string | any;
  readOnly?: boolean;
  disabled?: boolean;
  showOptionalTag?: boolean;
  defaultValue?: string | number;
}
