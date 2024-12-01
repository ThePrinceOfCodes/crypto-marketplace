import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import DatesField from "@common/components/FormInputs/DatesField";
import { htmlIds } from "@cypress/utils/ids";
import { Alert } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Form, Formik, FormikProps } from "formik";
import { useLocale } from "locale";
import { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { EducationResetDialogProps, EducationResetDialogRef } from "./types";

function EducationResetDialog(
  props: EducationResetDialogProps,
  ref: Ref<EducationResetDialogRef>,
) {
  const { onClose, onOk, alert } = props;
  const { text } = useLocale();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setOpen(false);
  };

  const handleOk = async ({ date }: { date: Date }) => {
    try {
      await onOk({
        date: dayjs(date).format("YYYY-MM-DD"),
      });
      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (typeof err?.response?.data === "string")
        toast.error(err.response.data);
      else toast.error(err.response.data?.message);
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

  interface FormValues {
    [htmlIds.super_save_education_reset_date]: string;
  }

  const initialValues: FormValues = {
    [htmlIds.super_save_education_reset_date]: "",
  };

  const validationSchema = () =>
    Yup.object({
      [htmlIds.super_save_education_reset_date]: Yup.date()
        .required(text("education_management_education_reset_date_required"))
        .nullable()
        .typeError(text('form_error_invalid_date')),
    });

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={text("education_management_education_reset_dialog_title")}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          handleOk({ date: new Date(values.super_save_education_reset_date) });
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
          isSubmitting,
        }: FormikProps<FormValues>) => {
          const dateFieldProps = (field: keyof FormValues) => {
            const error = touched[field] && Boolean(errors[field]);
            const helperText = touched[field] && errors[field];

            const onBlur = () =>
              !values[field] ? setFieldTouched(field, true) : null;

            const onChange = (value: Dayjs | null) => {
              setFieldValue(
                field,
                value ? dayjs(value).format("YYYY-MM-DD") : "",
              );
            };

            return { id: field, error, helperText, onBlur, onChange };
          };

          return (
            <Form className="flex flex-col gap-5">
              <div className="mt-3">
                <DatesField
                  label={text(
                    "education_management_education_reset_dialog_date_label",
                  )}
                  {...dateFieldProps(htmlIds.super_save_education_reset_date)}
                />
              </div>
              <div className="flex space-x-3">
                <FormFooter
                  loading={isSubmitting}
                  handleClose={handleClose}
                  cancelText={text("date_modal_cancel_text")}
                  submitText={text("date_modal_ok_text")}
                  submitBtnId={htmlIds.btn_super_save_education_reset}
                />
              </div>

              {alert && <Alert severity="warning">{alert}</Alert>}
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
}

export default forwardRef(EducationResetDialog);
