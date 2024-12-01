import * as Yup from "yup";
import { Box } from "@mui/material";
import { useLocale } from "locale";
import {
  ISendNotificationModalProps,
  ISendNotificationModalSubmitData,
} from "./types";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import { Formik, Form } from "formik";
import {
  requiredStringURLValidator,
  requiredStringValidator,
} from "@common/utils/validationSchemas";

const initialValues = {
  title: "",
  body: "",
  link: "",
};

function SendNotificationModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
}: Readonly<ISendNotificationModalProps>) {
  const { text } = useLocale();

  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["title", "body"],
      text("form_error_required"),
    );

    const url_v = requiredStringURLValidator(
      ["link"],
      text("form_error_required"),
      text("form_error_invalid_url"),
    );

    return Yup.object().shape({ ...string_v, ...url_v });
  };

  const handleOnSubmit = (data: ISendNotificationModalSubmitData) => {
    onOk(data);
  };

  const clearErrorOnTouch = (setFieldTouched: (field: string, touched: boolean, shouldValidate?: boolean) => void, setFieldError: (field: string, message: string | undefined) => void,
    field: string, otherFields: (keyof ISendNotificationModalSubmitData)[] = ["title", "body", "link"]) => {
    setFieldTouched(field, true, false);
    setFieldError(field, "");
    otherFields.forEach((otherField) => {
      if (otherField !== field) {
        setFieldTouched(otherField, false);
        setFieldError(otherField, "");
      }
    });
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={text("send_notification_management_modal_send_title")}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema()}
        onSubmit={(val) => handleOnSubmit(val)}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ errors, touched, getFieldProps, setFieldTouched, setFieldError }) => {
          function fieldProps(field: keyof ISendNotificationModalSubmitData) {
            const error = touched[field] && Boolean(errors[field]);
            const helperText = touched[field] && errors[field];

            return {
              error, helperText, ...getFieldProps(field), onBlur: () => {
                setFieldTouched(field);
              },
              onFocus: () => {
                clearErrorOnTouch(setFieldTouched, setFieldError, field);
              },
            };
          }

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <TextFieldInput
                  label={text("notification_management_add_page_title")}
                  placeholder={text(
                    "send_notification_management_title_placeholder",
                  )}
                  {...fieldProps("title")}
                />
                <TextFieldInput
                  label={text("notification_management_add_page_body")}
                  placeholder={text(
                    "send_notification_management_body_placeholder",
                  )}
                  {...fieldProps("body")}
                />

                <TextFieldInput
                  label={text("notification_management_add_page_link")}
                  placeholder={text(
                    "send_notification_management_link_placeholder",
                  )}
                  {...fieldProps("link")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={onCancel}
                    loading={isSubmitting}
                    cancelText={text("add_ads_management_cancel_btn_text")}
                    submitText={text("add_ads_management_submit_btn_text")}
                  />
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
}

export default SendNotificationModal;
