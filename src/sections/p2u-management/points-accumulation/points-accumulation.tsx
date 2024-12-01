import { Spinner } from "@common/components";
import Radio from "@mui/material/Radio";
import Switch from "@mui/material/Switch";
import {
  ISavePointAccumulationProps,
  useGetPointAccumulationSettings,
  useSavePointAccumulation,
  ExtendedISavePointAccumulationProps,
} from "api/hooks";
import clsx from "clsx";
import { useLocale } from "locale";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { Form, Formik } from "formik";
import { Box } from "@mui/material";
import * as Yup from "yup";
import dayjs from "dayjs";

const label = { inputProps: { "aria-label": "Switch demo" } };
const MAX_DAYS = 99999999;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function filterDataByKey({
  data,
  key,
}: {
  data: { key: string; value: string }[] | undefined;
  key: string;
}) {
  if (data === undefined) return undefined;
  const filteredObject = data.find((item) => item.key === key);
  return filteredObject?.value || undefined;
}

const RadioButton = ({
  disabled = false,
  label,
  labelClass,
  handleChange = () => { },
  value,
  className,
  checked,
  defaultChecked,
}: {
  disabled: boolean;
  className?: string;
  value: string;
  label: string;
  labelClass?: string;
  handleChange?: (value: string) => void;
  checked?: boolean;
  defaultChecked?: boolean;
}) => {
  return (
    <div
      className={clsx(
        className ? className : styles["accumulate-radio-body"],
        "cursor-pointer",
      )}
      onClick={() => {
        if (!disabled) handleChange(value);
      }}
    >
      <Radio
        disabled={disabled}
        size={"small"}
        checked={!disabled && checked}
        value={value}
        inputProps={{ "aria-label": `${value}` }}
        defaultChecked={defaultChecked}
      />
      <span className={clsx(styles["accumulate-text"], labelClass)}>
        {label}
      </span>
    </div>
  );
};

const convertToDigit = (value: string) => {
  const digitsArray = value.match(/\d+/g);
  const result = digitsArray ? digitsArray.join("") : "";
  return result;
};

const LeftLabel = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className={"flex flex-col w-[240px] space-y-2"}>
      <span className={styles["title"]}>{title}</span>
      <span className={clsx(styles["sub-title"])}>{subtitle}</span>
    </div>
  );
};

const PointsAccumulation = () => {
  const { text } = useLocale();
  let setFieldValueProp: any;
  const {
    data: pointAccumulationDataRes,
    refetch,
    isFetching,
    isLoading,
  } = useGetPointAccumulationSettings();
  const pointAccumulationData = pointAccumulationDataRes?.settings;

  const { mutateAsync: saveDBInitialTokens, isLoading: submitting } =
    useSavePointAccumulation();


  const cardAccumulationArray = [
    {
      id: 1,
      value: "1",
      label: text("affiliate_register_enable"),
    },
    {
      id: 2,
      value: "0",
      label: text("affiliate_register_disable"),
    }
  ];
  const accumulatePointArray = [
    {
      id: 1,
      value: "all",
      label: text("point_accumulation_setting_accumulation_all"),
    },
    {
      id: 2,
      value: "p2u_stores",
      label: text("point_accumulation_setting_accumulation_p2u_stores"),
    }
  ];
  const calculatePointArray = [
    {
      id: 1,
      value: "manual",
      label: text(
        "point_accumulation_setting_calculate_point_manual",
      ),
    },
    {
      id: 2,
      value: "cron",
      label: text(
        "point_accumulation_setting_calculate_point_cron_job",
      ),
    }
  ];

  const [disabled, setDisabled] = useState(false);

  const [cronData, setCronData] = useState({
    time: "--:--",
    days: "0",
  });

  const [calculatePoints, setCalculatePoints] = useState("");


  const handleCalculatePoint = (value: string) => {
    if (!disabled) setCalculatePoints(value);
  };


  const dataReset = () => {
    if (!pointAccumulationData) return;
    const enabled = pointAccumulationData?.ENABLE_P2U_ACCUMULATION == "1";
    setDisabled(!enabled);
    if (pointAccumulationData?.CALCULATE_POINTS_WITH == "manual") {
      setCalculatePoints(pointAccumulationData?.CALCULATE_POINTS_WITH);
      setCronData({
        ...cronData,
        time: "--:--",
        days: "0",
      });
    }
    else if (pointAccumulationData?.CALCULATE_POINTS_WITH?.split("+").includes("cron")) {
      const parts = pointAccumulationData?.CALCULATE_POINTS_WITH.split("+");
      setCronData({
        ...cronData,
        time: parts[1],
        days: parts[2],
      });
      setFieldValueProp("CRON_DATE", parts[2]);
      setFieldValueProp("CRON_TIME", parts[1]);
      setCalculatePoints("cron");
    }
  };

  useEffect(() => {
    if (!isFetching && !isLoading && pointAccumulationData) dataReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, isLoading]);

  const handleUpdate = async (values: ExtendedISavePointAccumulationProps) => {

    const calcPointsWith = () => {
      if (values.CALCULATE_POINTS_WITH === "manual") {
        setCronData({
          ...cronData,
          time: "--:--",
          days: "0",
        });
        values.CRON_DATE = "";
        values.CRON_TIME = "";
        return "manual";
      } else {
        return `cron+${cronData.time}+${cronData.days}`;
      }
    };
    const currentData = {
      ...values,
      ENABLE_P2U_ACCUMULATION: disabled ? "0" : "1",
      CALCULATE_POINTS_WITH: calcPointsWith(),
    };

    if (pointAccumulationData)
      await saveDBInitialTokens({
        ENABLE_P2U_ACCUMULATION: currentData.ENABLE_P2U_ACCUMULATION,
        P2U_STORE_PERCENTAGE: currentData?.P2U_STORE_PERCENTAGE.toString(),
        NON_P2U_STORE_PERCENTAGE: currentData?.NON_P2U_STORE_PERCENTAGE.toString(),
        CALCULATE_THRESHOLD: currentData?.CALCULATE_THRESHOLD.toString(),
        CALCULATE_POINTS_WITH: currentData?.CALCULATE_POINTS_WITH,
        ACCUMULATE_POINTS_FOR: currentData?.ACCUMULATE_POINTS_FOR,
        MULTIPLE_CARD_ACCUMULATION: currentData?.MULTIPLE_CARD_ACCUMULATION,
        SAME_CARD_ACCUMULATION: currentData?.SAME_CARD_ACCUMULATION,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((res) => {
          refetch();
          toast(text("setting_variable_toast_settings_updated_successfully"), {
            type: "success",
          });
        })
        .catch((err) => {
          toast(err.message || "Error", {
            type: "error",
          });
        });
  };

  const makDatetreshHold = (value: number) => {
   if (value >= MAX_DAYS) return MAX_DAYS;
    return value;
  };

  const getThresholdDates = (value: number) => {

    if (value === 0) return "";

    const currentDate = new Date();
    const daysLater = new Date(currentDate);
    daysLater.setDate(currentDate.getDate() - makDatetreshHold(value));

    if (value > MAX_DAYS) {
    return null;
    }

    if (value <= 3 && daysLater.getMonth() == currentDate.getMonth()) {
      let ans = `${currentDate.toLocaleString("default", {
        month: "short",
      })} ${currentDate.getDate()}`;
      let val = value,
        i = 1;

      while (val--) {
        const temDays = new Date(currentDate);
        temDays.setDate(currentDate.getDate() - i);
        ans += `, ${temDays.getDate()}`;
        i++;
      }

      return `${ans}${text("point_accumulation_setting_will_be_accumulated")}`;
    }

    return `${daysLater.getDate()} ${daysLater.toLocaleString("default", {
      month: "short",
    })}-${currentDate.getDate()} ${currentDate.toLocaleString("default", {
      month: "short",
    })} ${text("point_accumulation_setting_will_be_accumulated")}`;
  };


  useEffect(() => {
    // eslint-disable-next-line quotes
    const numberInputs = document.querySelectorAll('input[type="number"]');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preventMouseWheel = (e: any) => {
      numberInputs.forEach((input) => {
        if (input === document.activeElement) {
          e.preventDefault();
        }
      });
    };

    // Add event listeners to disable mouse wheel changes
    numberInputs.forEach((input) => {
      input.addEventListener("mousewheel", preventMouseWheel, {
        passive: false,
      });
      input.addEventListener("DOMMouseScroll", preventMouseWheel, {
        passive: false,
      });
    });

    return () => {
      // Remove event listeners when the component is unmounted
      numberInputs.forEach((input) => {
        input.removeEventListener("mousewheel", preventMouseWheel);
        input.removeEventListener("DOMMouseScroll", preventMouseWheel);
      });
    };
  }, []);

  // validation schema for formik
  const validationSchema = Yup.object().shape({
    ENABLE_P2U_ACCUMULATION: Yup.string(),
    P2U_STORE_PERCENTAGE: Yup.string()
      .required(text("point_accumulation_setting_form_error_threshold_percentage"))
      .test("is-between", "P2U Store percentage needs to be set between 0 and 100.", (value) => {
        if (value) {
          const percentage = Number(value);
          return percentage >= 0 && percentage <= 100;
        }
        return true;
      }),
    NON_P2U_STORE_PERCENTAGE: Yup.string()
      .required(text("point_accumulation_setting_form_error_threshold_percentage_non_stores"))
      .test("is-between", "Non-P2U Store percentage needs to be set between 0 and 100." , (value) => {
        if (value) {
          const percentage = Number(value);
          return percentage >= 0 && percentage <= 100;
        }
        return true;
      }),
    CALCULATE_THRESHOLD: Yup.string()
      .required(text("point_accumulation_setting_form_error_threshold_positive_number"))
      .test("is-positive", "Threshold days needs to be set as a positive number.", (value) => {
        if (value) {
          const days = Number(value);
          return days > 0;
        }
        return true;
      })
      .test("is-within-limit", text("point_accumulation_setting_form_error_threshold_days"), (value) => {
      if (value) {
        const days = Number(value);
        return days <= MAX_DAYS;
      }
      return true;
    }),
    CALCULATE_POINTS_WITH: Yup.string().required(text("point_accumulation_setting_form_error_method_to_calculate")),
    ACCUMULATE_POINTS_FOR: Yup.string().required(text("point_accumulation_setting_form_error_method_to_accumulate")),
    MULTIPLE_CARD_ACCUMULATION: Yup.string().required(text("point_accumulation_setting_form_error_method_to_multiple_card")),
    SAME_CARD_ACCUMULATION: Yup.string().required(text("point_accumulation_setting_form_error_same_card")),
    CRON_DATE: calculatePoints === "cron" ? Yup.string().required(text("point_accumulation_setting_form_error_date")) : Yup.string(),
    CRON_TIME: calculatePoints === "cron" ? Yup.string().required(text("point_accumulation_setting_form_error_time")).matches(
      /^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please put correct time values for cron job."
    ) : Yup.string(),
  });


  return (
    <div className={"flex flex-col p-6"}>
      <div className={"flex justify-between"}>
        <div className={"flex flex-col"}>
          <span className={styles["main-title"]}>
            {text("point_accumulation_setting_title")}
          </span>
          <span className={styles["sub-title"]}>
            {text("point_accumulation_setting_sub_title")}
          </span>
        </div>
        <div>
          <Switch
            checked={!disabled}
            onClick={() => {
              setDisabled(!disabled);
            }}
            {...label}
          />
        </div>
      </div>
      <Formik
        initialValues={{ ...pointAccumulationData, CRON_DATE: "0", CRON_TIME: "--:--" } as ExtendedISavePointAccumulationProps}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={(values) => {
          handleUpdate(values);
        }}
      >
        {({ getFieldProps, errors, touched, setFieldValue, values, resetForm }) => {
          setFieldValueProp = setFieldValue;
          return (
            <Form>
              <Box
                sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}
              >
                <div className={"flex flex-col"}>
                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 pt-12 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_p2u_store_percentage_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_p2u_store_percentage_sub_title",
                      )}
                    />
                    <div className={"flex md:justify-center"}>
                      <TextFieldInput
                        error={touched.P2U_STORE_PERCENTAGE && Boolean(errors.P2U_STORE_PERCENTAGE)}
                        helperText={touched.P2U_STORE_PERCENTAGE && errors.P2U_STORE_PERCENTAGE}
                        label={"%"}
                        placeholder={"%"}
                        InputLabelProps={{ shrink: !!getFieldProps("P2U_STORE_PERCENTAGE").value }}
                        {...getFieldProps("P2U_STORE_PERCENTAGE")}
                        type="number"
                        className='w-auto xl:w-[360px] h-[44px] py-0 rounded-none'
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 pt-12 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_non_p2u_store_percentage_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_non_p2u_store_percentage_sub_title",
                      )}
                    />
                    <div className={"flex md:justify-center"}>
                      <TextFieldInput
                        error={touched.NON_P2U_STORE_PERCENTAGE && Boolean(errors.NON_P2U_STORE_PERCENTAGE)}
                        helperText={touched.NON_P2U_STORE_PERCENTAGE && errors.NON_P2U_STORE_PERCENTAGE}
                        InputLabelProps={{ shrink: !!getFieldProps("NON_P2U_STORE_PERCENTAGE").value }}
                        label={"%"}
                        placeholder={"%"}
                        {...getFieldProps("NON_P2U_STORE_PERCENTAGE")}
                        type="number"
                        className='w-auto xl:w-[360px] h-[44px] py-0 rounded-none'
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 pt-12 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text("point_accumulation_setting_calculate_threshold_title")}
                      subtitle={text(
                        "point_accumulation_setting_calculate_threshold_sub_title",
                      )}
                    />
                    <div
                      className={
                        "flex flex-col xl:flex-row gap-4 xl:gap-0 xl:space-x-5 justify-end md:justify-center xl:items-center"
                      }
                    >
                      <div
                        className={"flex w-full md:justify-center items-end xl:w-auto"}
                      >
                        <TextFieldInput
                          error={touched.CALCULATE_THRESHOLD && Boolean(errors.CALCULATE_THRESHOLD)}
                          helperText={touched.CALCULATE_THRESHOLD && errors.CALCULATE_THRESHOLD}
                          label={text("withdrawal_information_days")}
                          InputLabelProps={{ shrink: !!getFieldProps("CALCULATE_THRESHOLD").value }}
                          placeholder={text("withdrawal_information_days")}
                          {...getFieldProps("CALCULATE_THRESHOLD")}
                          disabled={disabled}
                          type="number"
                          className='w-auto xl:w-[360px] h-[44px] py-0 rounded-none'
                          />
                      </div>

                      <div className="w-full flex justify-end md:justify-center">
                        <span>{getThresholdDates(Number(values.CALCULATE_THRESHOLD))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"py-8 border-y mt-12"}>
                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_multiple_card_accumulation_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_multiple_card_accumulation_sub_title",
                      )}
                    />
                    <div className={"flex w-full justify-start xl:w-auto xl:space-x-5"}>
                      {
                        cardAccumulationArray.map((item) => {
                          return (
                            <RadioButton
                              key={item.id}
                              disabled={disabled}
                              label={item.label}
                              value={item.value}
                              checked={item.value === values?.MULTIPLE_CARD_ACCUMULATION}
                              handleChange={() => setFieldValue("MULTIPLE_CARD_ACCUMULATION", item.value)}
                            />
                          );
                        })
                      }
                    </div>
                  </div>
                </div>

                <div className={"py-8 border-b"}>
                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_same_card_accumulation_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_same_card_accumulation_sub_title",
                      )}
                    />
                    <div className={"flex w-full justify-start xl:w-auto xl:space-x-5"}>
                      {
                        cardAccumulationArray.map((item) => {
                          return (
                            <RadioButton
                              key={item.id}
                              disabled={disabled}
                              label={item.label}
                              value={item.value}
                              checked={item.value === values?.SAME_CARD_ACCUMULATION}
                              handleChange={() => setFieldValue("SAME_CARD_ACCUMULATION", item.value)}
                            />
                          );
                        })
                      }
                    </div>
                  </div>
                </div>

                <div className={"py-8 border-b"}>
                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_accumulation_point_for_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_accumulation_point_for_sub_title",
                      )}
                    />
                    <div className={"flex w-full justify-start xl:w-auto xl:space-x-5"}>
                      {
                        accumulatePointArray.map((item) => {
                          return (
                            <RadioButton
                              key={item.id}
                              disabled={disabled}
                              label={item.label}
                              value={item.value}
                              checked={item.value === values?.ACCUMULATE_POINTS_FOR}
                              handleChange={() => setFieldValue("ACCUMULATE_POINTS_FOR", item.value)}
                            />
                          );
                        })
                      }
                    </div>
                  </div>
                </div>

                <div className={"mt-8"}>
                  <div
                    className={
                      "flex flex-col xl:flex-row gap-4 xl:gap-0 xl:space-x-[54px]"
                    }
                  >
                    <LeftLabel
                      title={text(
                        "point_accumulation_setting_calculate_point_with_title",
                      )}
                      subtitle={text(
                        "point_accumulation_setting_calculate_point_with_sub_title",
                      )}
                    />
                    <div className="space-y-4">
                      <div
                        className={
                          "flex flex-col md:px-4 gap-4 xl:gap-0  items-start"
                        }
                      >
                        {
                          calculatePointArray.map((item) => {
                            return (
                              <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4">
                                <RadioButton
                                  className="w-28"
                                  disabled={disabled}
                                  label={item.label}
                                  value={item.value}
                                  checked={values?.CALCULATE_POINTS_WITH?.includes(item.value) || false}
                                  handleChange={() => {
                                    setFieldValue("CALCULATE_POINTS_WITH", item.value);
                                    handleCalculatePoint(item.value);
                                  }}
                                />
                                <div>
                                  <div className={`flex items-center gap-4 md:gap-8 ${item.value === "cron" && calculatePoints === "cron" ? "flex" : "hidden"}`}>
                                    <div >
                                      <TextFieldInput
                                        disabled={disabled}
                                        type="time"
                                        error={touched.CRON_TIME && Boolean(errors.CRON_TIME)}
                                        helperText={touched.CRON_TIME && errors.CRON_TIME}
                                        label={"KST"}
                                        placeholder={"KST"}
                                        value={cronData.time}

                                        onChange={(e) => {
                                          setFieldValue("CRON_TIME", e.target.value);
                                          setCronData({
                                            ...cronData,
                                            time: e.target.value,
                                          });
                                        }
                                        }
                                        className=' h-[44px] w-auto  py-0 '
                                      />
                                    </div>
                                    <div className='mx-4'>
                                      <TextFieldInput
                                        disabled={disabled}
                                        error={touched.CRON_DATE && Boolean(errors.CRON_DATE)}
                                        helperText={touched.CRON_DATE && errors.CRON_DATE}
                                        type="text"
                                        label={text("point_accumulation_setting_calculate_point_after")}
                                        placeholder={text("point_accumulation_setting_calculate_point_after")}
                                        value={`${+cronData.days} ${text(
                                          "withdrawal_information_days",
                                        )}`}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                          setFieldValue("CRON_DATE", e.target.value);
                                          setCronData({
                                            ...cronData,
                                            days: convertToDigit(e.target.value),
                                          });
                                        }
                                        }
                                        className=' h-[44px] py-0 '
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end py-5">
                  <button
                    disabled={submitting}
                    type="button"
                    className="w-40 mt-5 mr-6 rounded-md border h-10 border-slate-400 bg-slate-50 py-2 px-6 text-sm font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      resetForm();
                      dataReset();
                    }
                    }
                  >
                    {text("setting_profile_account_info_button_cancel")}
                  </button>
                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-40 mt-5 h-10 bg-blue-500 text-white rounded-md"
                  >
                    {submitting && <Spinner />}
                    {text("setting_profile_account_info_button_save")}
                  </button>
                </div>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default PointsAccumulation;
