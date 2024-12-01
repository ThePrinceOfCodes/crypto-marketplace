import { forwardRef } from "react";
import { InputProps } from "./types";
import { INPUT_CLASS } from "@common/constants/classes";
import { LocalKeys, useLocale } from "locale";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InputText(props: InputProps, ref: any) {
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
    containerClassName,
    error,
    readOnly = false,
    disabled = false,
    showOptionalTag = false,
    defaultValue,
    ...restProps
  } = props;
  return (
    <div className={containerClassName}>
      {labelText && (
        <label
          htmlFor={labelFor}
          className="block mb-2 text-sm font-medium text-slate-500"
        >
          {text(labelText as LocalKeys)}{" "}
          <span className="text-[10px]">
            {!isRequired &&
              showOptionalTag &&
              `(${text("field_optional_tag")})`}
          </span>
        </label>
      )}
      <input
        onChange={onChange}
        value={value}
        id={id}
        name={name}
        type={type}
        required={isRequired}
        readOnly={readOnly}
        disabled={disabled}
        className={`${INPUT_CLASS} ${className} ${
          error ? "border-red-600" : ""
        }`}
        placeholder={text(placeholder as LocalKeys)}
        ref={ref}
        defaultValue={defaultValue}
        {...restProps}
      />
      {error && <div className="text-xs mt-1 text-red-600">{error}</div>}
    </div>
  );
}

export default forwardRef(InputText);
