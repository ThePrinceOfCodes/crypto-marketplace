import useResponsive from "@common/hooks/useResponsive";
import { htmlIds } from "@cypress/utils/ids";
import { useLocale } from "locale";
import React from "react";
import Flatpickr from "react-flatpickr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DatePicker = (props: any) => {
  const { isBigScreen } = useResponsive();
  const { text } = useLocale();
  const {
    options: restOptions = {},
    flatPickerClass = "w-40",
    ...rest
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    mode: "range",
    static: !isBigScreen,
    // monthSelectorType: "static",
    dateFormat: "M j, Y",
    defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
    prevArrow:
      "<svg class='fill-current' width='7' height='11' viewBox='0 0 7 11'><path d='M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z' /></svg>",
    nextArrow:
      "<svg class='fill-current' width='7' height='11' viewBox='0 0 7 11'><path d='M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z' /></svg>",
    onReady: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedDates: any,
      dateStr: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instance: { element: { value: any } },
    ) => {
      instance.element.value = dateStr.replace("to", "-");
    },
    onChange: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedDates: any,
      dateStr: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instance: { element: { value: any } },
    ) => {
      instance.element.value = dateStr.replace("to", "-");
    },
    ...restOptions,
  };

  return (
    <div className="flex items-center border border-slate-300 focus:border-slate-500 rounded-lg">
      <svg
        className="w-4 h-4 mr-2 fill-current text-slate-500 ml-3"
        viewBox="0 0 16 16"
      >
        <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z" />
      </svg>
      <Flatpickr
        id={htmlIds.input_data_filter_date}
        className={`text-slate-700 text-sm hover:text-slate-600 font-small border-none rounded-r-lg ${isBigScreen ? "min-w-64" : "w-full"} ${flatPickerClass}`}
        {...rest}
        options={options}
        placeholder={text("select_date")}
      />
    </div>
  );
};

export default DatePicker;
