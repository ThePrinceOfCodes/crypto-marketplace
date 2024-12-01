import {
  Alert,
  Box,
  Switch,
} from "@mui/material";
import { useLocale } from "locale";
import React, {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { EducationCronDialogProps, EducationCronDialogRef } from "./types";
import { useGetSettings, useSaveDBInitialTokens } from "api/hooks";
import DatesField from "@common/components/FormInputs/DatesField";
import dayjs, { Dayjs } from "dayjs";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { Form, Formik } from "formik";
import * as Yup from "yup";

function EducationCronDialog(
  props: EducationCronDialogProps,
  ref: Ref<EducationCronDialogRef>,
) {
  const [date, setDate] = useState<Dayjs | null | string>(null);
  const [educaitonCronBool, setEducationCronBool] = useState<boolean>(false);
  const { onClose, alert } = props;
  const [loading, setLoading] = useState(false);
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

  const { data, refetch } = useGetSettings();
  const { mutateAsync: saveDBInitialTokens } = useSaveDBInitialTokens();

  useEffect(() => {
    const EDUCATION_DATE = data?.find(
      (item) => item.key === "EDUCATION_DATE",
    )?.value;
    if (EDUCATION_DATE !== "0" && EDUCATION_DATE) {
      setDate(dayjs().date(parseInt(EDUCATION_DATE)) as Dayjs);
      setEducationCronBool(true);
    } else {
      setDate(dayjs(new Date()));
      setEducationCronBool(false);
    }
  }, [data, open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setLoading(false);
    setDate(dayjs(new Date()));
    setOpen(false);
  };

  const handleOk = async ({ date }: { date: Date }) => {
    try {
      setLoading(true);
      const educationDateVal = educaitonCronBool
        ? dayjs(date).format("D")
        : "0";
      await saveDBInitialTokens({
        key: "EDUCATION_DATE",
        value: educationDateVal as string,
      });
      refetch();
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setOpen(true);
      },
    }),
    [],
  );

  const validationSchema = () =>
    Yup.object({
      ["cronDate"]: Yup.date()
        .required(text("education_management_education_reset_date_required"))
        .nullable()
        .typeError(text("invalid_date")),
    });

  return (
    <CustomDialog titleText={text("education_management_education_cron_setting_dialog_title")} onClose={handleClose} open={open}>
      <Formik
        initialValues={{ cronDate: dayjs(date).format("YYYY-MM-DD") }}
        validationSchema={validationSchema()}
        onSubmit={async (values) => {
          handleOk({ date: new Date(values.cronDate) });
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
        }) => {

          return (
            <Form>
              <div className="flex flex-col">
                <label className="text-slate-700 text-sm font-medium">
                  {text("education_management_education_reset_dialog_cron_label")}
                </label>
                <label aria-label="education Icon">
                  <Switch
                    checked={educaitonCronBool}
                    onClick={() => setEducationCronBool(!educaitonCronBool)}
                  />
                </label>
              </div>
              {educaitonCronBool && (
                <div>
                  <label className="text-slate-700 text-sm font-medium">
                    {text("education_management_education_reset_dialog_date_label")}
                  </label>
                  <DatesField
                    value={dayjs(values.cronDate)}
                    format="DD"
                    error={
                      touched.cronDate &&
                      Boolean(errors.cronDate)
                    }
                    helperText={
                      touched.cronDate && errors.cronDate
                    }
                    onBlur={() =>
                      !values.cronDate
                        ? setFieldTouched("cronDate", true)
                        : null
                    }
                    onChange={(event) => {
                      setFieldValue(
                        "cronDate",
                        dayjs(event).format("YYYY-MM-DD"),
                      );
                    }}
                  />
                </div>
              )}
              {alert && (
                <Alert className={"mt-5"} severity="warning">
                  {alert}
                </Alert>
              )}
              <Box sx={{ display: "flex", mt: 4, columnGap: 2 }}>
                <FormFooter handleClose={handleClose}
                  loading={loading}
                  cancelText={text("date_modal_cancel_text")}
                  submitText={text("date_modal_ok_text")} />
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog >
  );
}

export default forwardRef(EducationCronDialog);
