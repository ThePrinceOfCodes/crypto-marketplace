import { forwardRef } from "react";
import { InputProps } from "./types";
import { INPUT_CLASS } from "@common/constants/classes";
import { LocalKeys, useLocale } from "locale";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InputTextarea(props: InputProps, ref: any) {
  const { text } = useLocale();
  const {
    onChange,
    value,
    labelText,
    labelFor,
    id,
    name,
    isRequired = false,
    placeholder,
    className,
    error,
    readOnly = false,
    disabled = false,
    showOptionalTag = false,
    ...restProps
  } = props;
  return (
    <div>
      <label
        htmlFor={labelFor}
        className="block mb-2 mt-4 text-sm font-medium text-slate-500"
      >
        {text(labelText as LocalKeys)}{" "}
        <span className="text-[10px]">
          {!isRequired && showOptionalTag && `(${text("field_optional_tag")})`}
        </span>
      </label>

      <textarea
        onChange={onChange}
        value={value}
        id={id}
        name={name}
        required={isRequired}
        readOnly={readOnly}
        disabled={disabled}
        className={`${INPUT_CLASS} ${className} ${
          error ? "border-red-600" : ""
        }`}
        placeholder={text(placeholder as LocalKeys)}
        ref={ref}
        {...restProps}
      />
      {error && <div className="text-xs mt-1 text-red-600">{error}</div>}
    </div>
  );
}

export default forwardRef(InputTextarea);
