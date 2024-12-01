import { forwardRef } from "react";
import { InputTextWithIconProps } from "./types";
import { INPUT_CLASS } from "@common/constants/classes";
import { LocalKeys, useLocale } from "locale";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InputTextWithIcon(props: InputTextWithIconProps, ref: any) {
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
    icon,
    inputClassName,
    ...restProps
  } = props;
  return (
    <div>
      <label
        htmlFor={labelFor}
        className="block mb-2 mt-4 text-sm font-medium text-slate-500"
      >
        {text(labelText as LocalKeys)}
      </label>

      <div
        className={`flex ${INPUT_CLASS} ${className} ${
          error ? "border-red-600" : ""
        }`}
      >
        <input
          onChange={onChange}
          value={value}
          id={id}
          name={name}
          type={type}
          required={isRequired}
          placeholder={text(placeholder as LocalKeys)}
          ref={ref}
          {...restProps}
          className={`bg-gray-50 w-72 focus:outline-none ${inputClassName}`}
        />
        {icon && icon}
      </div>
      {error && (
        <div className="text-xs mt-1 text-red-600">
          {text(error as LocalKeys)}
        </div>
      )}
    </div>
  );
}

export default forwardRef(InputTextWithIcon);
