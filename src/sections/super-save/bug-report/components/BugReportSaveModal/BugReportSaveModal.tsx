import { Box } from "@mui/material";
import { useLocale } from "locale";
import CustomDialog from "@common/components/CustomDialog";
import { Formik, Form } from "formik";
import FormFooter from "@common/components/FormFooter";
import * as Yup from "yup";
import TextFieldInput from "@common/components/FormInputs/TextField";

function BugReportSaveModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
}: {
  open: boolean;
  onOk: (emailBody?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const { text } = useLocale();

  const customValidation = Yup.object({
    emailBody: Yup.string().required(text("form_error_required")),
  });
  const initialValues = {
    emailBody: "",
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={text("super_save_bug_report_modal_title_action")}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={customValidation}
        onSubmit={(values) => onOk(values.emailBody)}
      >
        {({ getFieldProps, errors, touched }) => (
          <Form>
            <div className="mb-4">
              <TextFieldInput
                error={touched["emailBody"] && Boolean(errors["emailBody"])}
                rows={5}
                multiline
                placeholder={text("super_save_bug_report_placeholder")}
                label={text("super_save_bug_report_reply_label")}
                {...getFieldProps("emailBody")}
                helperText={touched["emailBody"] && errors["emailBody"]}
              />
            </div>
            <Box sx={{ display: "flex", columnGap: 2 }}>
              <FormFooter
                handleClose={onCancel}
                loading={isSubmitting}
                submitText={text("super_save_bug_report_modal_submit")}
                cancelText={text("super_save_bug_report_modal_cancel")}
              />
            </Box>
          </Form>
        )}
      </Formik>
    </CustomDialog>
  );
}

export default BugReportSaveModal;
