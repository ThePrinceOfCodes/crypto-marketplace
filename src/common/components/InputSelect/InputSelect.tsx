import { forwardRef } from "react";
import { InputSelectProps } from "./types";
import { LocalKeys, useLocale } from "locale";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { MenuItem, Select } from "@mui/material";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InputText(props: InputSelectProps, ref: any) {
  const { text } = useLocale();
  const {
    onChange,
    value,
    labelText,
    labelFor,
    id,
    name,
    type = "text",
    isRequired = false,
    placeholder,
    className,
    error,
    readOnly = false,
    disabled = false,
    options = [],
    ...restProps
  } = props;
  return (
    <div>
      {labelText && (
        <label
          htmlFor={labelFor}
          className="block mb-2 mt-4 text-sm font-medium text-slate-500"
        >
          {text(labelText as LocalKeys)}
        </label>
      )}

      <Select
        label={labelText}
        onChange={onChange}
        value={value}
        id={id}
        name={name}
        type={type}
        required={isRequired}
        readOnly={readOnly}
        disabled={disabled}
        className={`${className} ${error ? "border-red-600" : ""}`}
        placeholder={text(placeholder as LocalKeys)}
        ref={ref}
        {...restProps}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            <em>{option.label}</em>
          </MenuItem>
        ))}
      </Select>
      {error && (
        <div className="text-xs mt-1 flex items-center text-red-600">
          <WarningAmberOutlinedIcon className="text-sm inline-block mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

export default forwardRef(InputText);
