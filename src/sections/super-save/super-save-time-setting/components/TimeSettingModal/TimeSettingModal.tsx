import { Box, ListItemText, MenuItem, Modal } from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import { toast } from "react-toastify";
import { useDialog } from "@common/context";
import { useGetSuperSaveTime, useSetSuperSaveTime } from "api/hooks";
import { calculateTimeDiff } from "@common/utils/helpers";
import { LocalKeys, useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { queryClient } from "api";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormFooter from "@common/components/FormFooter";
import SelectField from "@common/components/FormInputs/SelectField";
import CustomDialog from "@common/components/CustomDialog";

interface TimeDataProps {
  toHour: string;
  fromHour: string;
  toMinute: string;
  fromMinute: string;
  timezone: string;
}

const labelStyle = "original";
const timezones = {
  ...allTimezones,
  "Europe/Berlin": "Frankfurt",
};

const TimeSettingModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose, handleSubmit }) => {
  const { text } = useLocale();
  const { confirmDialog, alertDialog } = useDialog();
  const { data } = useGetSuperSaveTime();
  const { mutateAsync: setSuperSaveTime, isLoading } = useSetSuperSaveTime();
  const [error, setError] = useState("");
  const { options } = useTimezoneSelect({
    labelStyle,
    timezones,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = (values: TimeDataProps) => {
    if (!error)
      confirmDialog({
        title: text("time_setting_modal_save_title"),
        content: text("time_setting_modal_save_confirmation"),
        cancelButtonText: text("time_setting_modal_save_cancel"),
        okButtonText: text("time_setting_modal_save"),
        onOk: () => onSubmit(values),
      });
  };

  const onSubmit = async (values: TimeDataProps) => {
    if (values.timezone && !error) {
      setSuperSaveTime({
        timezone: values.timezone,
        start_time: values.fromHour + ":" + values.fromMinute,
        end_time: values.toHour + ":" + values.toMinute,
      })
        .then((res) => {
          toast(res.data.result, {
            type: "success",
          });
          alertDialog({
            title: text("time_setting_modal_saved"),
            onOk: async () => {
              handleSubmit();
              handleClose();
              queryClient.invalidateQueries("super-save-time");
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

  const onClose = () => {
    setError("");
    handleClose();
  };

  const initialValues = {
    timezone: "(GMT+9:00) Seoul",
    fromHour: "09",
    fromMinute: "00",
    toHour: "18",
    toMinute: "00",
  };

  const validationSchema = Yup.object().shape({
    timezone: Yup.string().required(text("time_setting_modal_time_zone_error")),
    fromHour: Yup.string().required(),
    fromMinute: Yup.string().required(),
    toHour: Yup.string().required(),
    toMinute: Yup.string().required(),
  }).test("time-range", "Invalid time range", function (values) {
    const { fromHour, fromMinute, toHour, toMinute } = values;
    // Ensure all values are defined and can be compared
    if (fromHour === undefined || fromMinute === undefined || toHour === undefined || toMinute === undefined) {
      return false;
    }

    // Convert to numbers for comparison
    const fromHourInt = parseInt(fromHour, 10);
    const fromMinuteInt = parseInt(fromMinute, 10);
    const toHourInt = parseInt(toHour, 10);
    const toMinuteInt = parseInt(toMinute, 10);

    // Compare hours and minutes
    if (toHourInt > fromHourInt) {
      setError("");
      return true;
    } else if (toHourInt === fromHourInt && toMinuteInt > fromMinuteInt) {
      setError("");
      return true;
    } else {
      setError(text("time_setting_modal_save_error"));
      return false;
    }
  });

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("time_setting_modal_title")}
    >
      <div className="flex flex-row justify-between items-center py-6 bg-slate-100 px-4 my-4">
        <span className="text-xs">
          {text("time_setting_modal_time_zone")}
        </span>
        <span className="text-sm font-bold">
          {data
            ? data?.timezone
            : text("time_setting_modal_time_zone_error")}
        </span>
      </div>
      <div className="flex flex-row justify-between items-center py-6 bg-slate-100 px-4 my-2">
        <span className="text-xs">
          {text("time_setting_modal_participation_time")}
        </span>
        <span className="text-sm font-bold">
          {`${data ? data?.start_time : "00"}` +
            "~" +
            `${data ? data?.end_time : "00"}` +
            "\t"}
          {data &&
            calculateTimeDiff(
              data?.start_time,
              data?.end_time,
              text("time_setting_modal_hours"),
              text("time_setting_modal_minutes"),
            )}
        </span>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSave(values);
        }}
      >
        {({ errors, touched, getFieldProps }) => {
          return (
            <Form autoFocus>
              <Box
                sx={{ display: "flex", flexDirection: "column", rowGap: 3, marginTop: 4, gap: 2 }}
              >
                <SelectField
                  variant="outlined"
                  label={text("time_setting_modal_title")}
                  id={htmlIds.select_time_setting_time_zone}
                  error={touched.timezone && Boolean(errors.timezone)}
                  helperText={touched.timezone && errors.timezone}
                  {...getFieldProps("timezone")}
                >
                  {options.map((option, index) => (
                    <MenuItem key={index} value={option.label} className="text-xs">
                      <ListItemText
                        className="text-xs"
                        primary={text(option.label as LocalKeys)}
                      />
                    </MenuItem>
                  ))}
                </SelectField>
                <div className="space-y-4 mt-4">
                  <span className="text-sm">
                    {text("time_setting_modal_participation_time")}
                  </span>
                  <div className="flex flex-row flex-wrap justify-between content-center">
                    <div className="flex flex-row gap-4">
                      <SelectField
                        id={htmlIds.select_time_setting_modal_from_hour}
                        className="bg-gray-50 h-11  text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 mr-2"
                        inputProps={{ "aria-label": "Without label" }}
                        error={touched.fromHour && Boolean(errors.fromHour)}
                        helperText={touched.fromHour && errors.fromHour}
                        {...getFieldProps("fromHour")}
                        variant="outlined"
                      >
                        {[...Array(24).keys()].map((value) => (
                          <MenuItem
                            key={value}
                            value={value < 10 ? "0" + value : value.toString()}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={text(value < 10 ? ("0" + value) as LocalKeys : value.toString() as unknown as LocalKeys)}
                            />
                          </MenuItem>
                        ))}
                      </SelectField>
                      <SelectField
                        id={htmlIds.select_time_setting_modal_from_minute}
                        className="bg-gray-50 h-11 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600"
                        error={touched.fromMinute && Boolean(errors.fromMinute)}
                        helperText={touched.fromMinute && errors.fromMinute}
                        {...getFieldProps("fromMinute")}
                        inputProps={{ "aria-label": "Without label" }}
                        variant="outlined"
                      >
                        {[...Array(60).keys()].map((value) => (
                          <MenuItem
                            key={value}
                            value={value < 10 ? "0" + value : value.toString()}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={text(value < 10 ? ("0" + value) as LocalKeys : value.toString() as unknown as LocalKeys)}
                            />
                          </MenuItem>
                        ))}
                      </SelectField>
                    </div>
                    <span className="bg-gray-50 self-center">~</span>
                    <div className="flex flex-row w-auto gap-4">
                      <SelectField
                        id={htmlIds.select_time_setting_modal_to_hour}
                        className="bg-gray-50 h-11  text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 mr-2"
                        inputProps={{ "aria-label": "Without label" }}
                        error={touched.toHour && Boolean(errors.toHour)}
                        helperText={touched.toHour && errors.toHour}
                        {...getFieldProps("toHour")}
                        variant="outlined"
                      >
                        {[...Array(24).keys()].map((value) => (
                          <MenuItem
                            key={value}
                            value={value < 10 ? "0" + value : value.toString()}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={text(value < 10 ? ("0" + value) as LocalKeys : value.toString() as unknown as LocalKeys)}
                            />
                          </MenuItem>
                        ))}
                      </SelectField>
                      <SelectField
                        id={htmlIds.select_time_setting_modal_to_minute}
                        className="bg-gray-50 h-11 text-gray-900 sm:text-base text-base rounded-lg focus:ring-primary-600 focus:border-primary-600"
                        error={touched.toMinute && Boolean(errors.toMinute)}
                        helperText={touched.toMinute && errors.toMinute}
                        {...getFieldProps("toMinute")}
                        inputProps={{ "aria-label": "Without label" }}
                        variant="outlined"
                      >
                        {[...Array(60).keys()].map((value) => (
                          <MenuItem
                            key={value}
                            value={value < 10 ? "0" + value : value.toString()}
                          >
                            <ListItemText
                              className="text-xs"
                              primary={text(value < 10 ? ("0" + value) as LocalKeys : value.toString() as unknown as LocalKeys)}
                            />
                          </MenuItem>
                        ))}
                      </SelectField>
                    </div>
                  </div>
                </div>
                <div className="text-xs mt-1 text-red-600">{error}</div>
                <Box display="flex" flex={1} gap={2} mb={1}>
                  <FormFooter
                    handleClose={onClose}
                    loading={isLoading}
                    submitText={text("time_setting_modal_save")}
                    cancelText={text("time_setting_modal_cancel")}
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

export default TimeSettingModal;
