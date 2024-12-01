import {
  Box,
  MenuItem,
  ListItemText,
} from "@mui/material";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import { toast } from "react-toastify";
import { useDialog } from "@common/context";
import {
  useGetSuperSaveNotificationTime,
  useSetSuperSaveNotificationTime,
} from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { queryClient } from "api";
import SelectField from "@common/components/FormInputs/SelectField";

const labelStyle = "original";
const timezones = {
  ...allTimezones,
  "Europe/Berlin": "Frankfurt",
};

type isInstantlyType = {
  label: string;
  value: string;
};

type values = {
  isInstantly: string,
  timezone: string,
  toHour: string,
  toMinute: string
}

const IS_INSTANTLY: isInstantlyType[] = [
  { label: "super_save_notification_instantly_yes", value: "Yes" },
  { label: "super_save_notification_instantly_no", value: "No" },
];

const NotificationTimeModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose, handleSubmit }) => {
  const { text } = useLocale();
  const { confirmDialog, alertDialog } = useDialog();
  const { data } = useGetSuperSaveNotificationTime();
  const { mutateAsync: setSuperSaveNotificationTime, isLoading } =
    useSetSuperSaveNotificationTime();
  const [isInstantly, setIsInstantly] = useState<string>("Yes");
  const [toHour, setToHour] = useState<string>("09");
  const [toMinute, setToMinute] = useState<string>("00");
  const [timezone, setTimeZone] = useState<string>("(GMT+9:00) Seoul");
  const [error, setError] = useState("");

  const { options } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setInitialValue = () => {

    setIsInstantly("Yes");
    setToHour("09");
    setToMinute("00");
    setTimeZone("(GMT+9:00) Seoul");

  };

  useEffect(() => {
    setError("");
  }, [toHour, toMinute]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = () => {
    confirmDialog({
      title: text("add_notification_save_title"),
      content: text("add_notification_save_confirmation"),
      cancelButtonText: text("add_notification_cancel"),
      okButtonText: text("add_notification_save"),
      onOk: () => onSubmit(),
    });
  };

  const onSubmit = async () => {
    if (timezone) {
      setSuperSaveNotificationTime({
        is_instantly: isInstantly === "Yes" ? true : false,
        timezone: timezone,
        set_time: toHour + ":" + toMinute,
      })
        .then((res) => {
          toast(res.data.result, {
            type: "success",
          });
          setInitialValue();
          alertDialog({
            title: text("add_notification_saved"),
            onOk: async () => {
              handleClose();
              handleSubmit();
              queryClient.invalidateQueries("super-save-notification-time");
            },
          });
        })
        .catch((err) => {
          toast(err?.response?.data.message, {
            type: "error",
          });
        });
    }
  };

  const setValues = (values: values) => {
    setIsInstantly(values.isInstantly);
    setToHour(values.toHour);
    setToMinute(values.toMinute);
    setTimeZone(values.timezone);
  };

  const handleClosePopup = () => {
    setInitialValue();
    handleClose();
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClosePopup}
      titleText={text("add_notification_time_title")}
    >
      <Formik
        onSubmit={handleSave}
        initialValues={{ isInstantly, timezone, toHour, toMinute }}
      >
        {({ values, getFieldProps }) => {
          //eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            setValues(values);
          }, [values]);

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <div className="flex flex-row justify-between py-6 bg-slate-100 px-4 my-2">
                  <span className="text-sm">
                    {text("add_notification_time_zone")}
                  </span>
                  <span className="text-sm font-bold">
                    {data
                      ? data?.timezone
                      : text("add_notification_select_time_zone")}
                  </span>
                </div>
                <div className="flex flex-row justify-between py-6 bg-slate-100 px-4 my-2">
                  <span className="text-sm">{text("add_notification_time")}</span>
                  <span className="text-sm font-bold">
                    {data
                      ? data?.is_instantly
                        ? text("add_notification_time_instantly")
                        : data?.set_time
                      : text("add_notification_set_time_warning")}
                  </span>
                </div>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, marginTop: "24px" }}>

                {/* for is instantly */}

                <SelectField
                  id={htmlIds.select_notification_time_is_instantly}
                  label={text("add_notification_is_instantly")}
                  {...getFieldProps("isInstantly")}
                  variant="outlined"
                >
                  {IS_INSTANTLY.map((item) => {
                    return (
                      <MenuItem
                        className="text-xs"
                        key={item.value}
                        value={item.value}
                      >
                        <ListItemText
                          className="text-xs"
                          primary={text(item.label as LocalKeys)}
                        />
                      </MenuItem>
                    );
                  })}
                </SelectField>

                <Box sx={{ display: "flex", columnGap: 2, marginTop: "16px" }}>

                  {/* for timezone */}

                  <SelectField
                    id={htmlIds.select_notification_time_time_zone}
                    label={text("add_notification_time")}
                    {...getFieldProps("timezone")}
                    variant="outlined"
                  >
                    {options.map((option, index) => (
                      <MenuItem key={index} value={option.label}>
                        <em>{option.label}</em>
                      </MenuItem>
                    ))}
                  </SelectField>

                  <span className="bg-gray-50 self-center">~</span>

                  {/* for hour */}

                  <Box sx={{ display: "flex", columnGap: 2 }}>
                    <SelectField
                      id={htmlIds.select_notification_time_modal_hour}
                      {...getFieldProps("toHour")}
                      variant="outlined"
                    >
                      {[...Array(24).keys()].map((value) => (
                        <MenuItem
                          key={value}
                          value={value < 10 ? "0" + value : value.toString()}
                        >
                          <em>{value < 10 ? "0" + value : value.toString()}</em>
                        </MenuItem>
                      ))}
                    </SelectField>

                    {/* for minute */}

                    <SelectField
                      id={htmlIds.select_notification_time_modal_minute}
                      {...getFieldProps("toMinute")}
                      variant="outlined"
                    >
                      {[...Array(60).keys()].map((value) => (
                        <MenuItem
                          key={value}
                          value={value < 10 ? "0" + value : value.toString()}
                        >
                          <em>{value < 10 ? "0" + value : value.toString()}</em>
                        </MenuItem>
                      ))}
                    </SelectField>
                  </Box>
                </Box>

                <div className="text-xs mt-1 text-red-600">{error}</div>

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    loading={isLoading}
                    handleClose={handleClose}
                    submitText={text("set_bank_fee_modal_save")}
                    cancelText={text("set_bank_fee_modal_cancel")}
                  />
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog >
  );
};

export default NotificationTimeModal;
