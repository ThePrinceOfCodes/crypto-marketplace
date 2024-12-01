import { Alert, Box } from "@mui/material";
import { useLocale } from "locale";
import * as Yup from "yup";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { MarkCompleteModalRef } from "./types";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import dayjs from "dayjs";
import DatesField from "@common/components/FormInputs/DatesField";
import { Form, Formik } from "formik";

type MarkCompleteModalProps = {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOk: (v: string) => Promise<any>;
  title: string;
  alert?: string;
};

function MarkCompleteModal(
  props: MarkCompleteModalProps,
  ref: Ref<MarkCompleteModalRef>,
) {
  const { onClose, onOk, title, alert } = props;
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .nullable()
      .required(text("form_error_required"))
      .typeError(text("form_error_invalid_date")),
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setOpen(false);
  };

  const handleOk = async (_date: { date: string }) => {
    try {
      await onOk(_date?.date);
      handleClose();
    } catch (error: unknown) {
      // console.log("error", error);
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

  return (
    <CustomDialog
      titleText={title}
      onClose={handleClose}
      open={open}
    >
      <Formik
        initialValues={{
          date: dayjs().format("YYYY-MM-DD"),
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleOk(values);
          setSubmitting(false);
        }}
      >
        {({
          isSubmitting,
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
        }) => (
          <Form>
            <DatesField
              label={text("date_modal_lable_text")}
              value={dayjs(values.date)}
              error={touched["date"] && Boolean(errors["date"])}
              helperText={touched["date"] && errors["date"]}
              onBlur={() => setFieldTouched("date", true)}
              onChange={(date) => {
                setFieldValue("date", dayjs(date).format("YYYY-MM-DD"));
              }}
              format="YYYY-MM-DD"
              className="text-slate-700 text-sm hover:text-slate-600 font-small w-full border-none rounded-r-lg"
            />

            {alert && (
              <Alert className={"mt-5"} severity="warning">
                {alert}
              </Alert>
            )}

            <Box sx={{ display: "flex", mt: 4, columnGap: 2 }}>
              <FormFooter
                handleClose={handleClose}
                loading={isSubmitting}
                cancelText={text("date_modal_cancel_text")}
                submitText={text("date_modal_ok_text")}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </CustomDialog>
  );
}

export default forwardRef(MarkCompleteModal);
