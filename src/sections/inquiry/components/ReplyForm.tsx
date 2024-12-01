import { Formik, Form } from "formik";
import { FormControl, Stack, FormLabel, FormGroup, Box } from "@mui/material";
import { useLocale, LocalKeys } from "locale";
import FormFooter from "@common/components/FormFooter";
import CheckboxField from "@common/components/FormInputs/CheckboxField";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";

type PropsInterface = {
  submitLoading: boolean;
  onSubmit: (data: {
    response: string;
    push_notification: boolean;
    send_email: boolean;
  }) => void;
  onCancel: () => void;
};

type FormikValues = {
  push_notification: boolean;
  send_email: boolean;
};

const initialValues = {
  response: "",
  push_notification: true,
  send_email: false,
};

const ReplyForm = ({ submitLoading, onSubmit, onCancel }: PropsInterface) => {
  const { text } = useLocale();
  const validationSchema = () =>
    Yup.object().shape({
      response: Yup.string().trim().required(
        text("inquiry_page_status_empty_response_error"),
      ),
      push_notification: Yup.boolean().required(text("form_error_required")),
      send_email: Yup.boolean().required(text("form_error_required")),
    });

  return (
    <Formik
      validationSchema={validationSchema()}
      validateOnBlur={false}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ values, getFieldProps, setFieldValue, errors, touched }) => {
        return (
          <Form>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel sx={{ mb: 1, color: "black" }}>
                  {text("inquiry_page_column_action_btn_send_response")}
                </FormLabel>

                <TextFieldInput
                  multiline
                  rows={4}
                  error={touched.response && Boolean(errors.response)}
                  helperText={touched.response && errors.response}
                  {...getFieldProps("response")}
                />
              </FormControl>

              <FormControl>
                <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
                  {[
                    {
                      name: "push_notification",
                      label: "inquiry_page_push_notification_checkbox_label",
                    },
                    {
                      name: "send_email",
                      label: "inquiry_page_send_email_checkbox_label",
                    },
                  ].map(({ name, label }) => (
                    <CheckboxField
                      key={name}
                      name={name}
                      onChange={(event: any) => {
                        if (event.target.checked) {
                          setFieldValue(name, true);
                        } else {
                          setFieldValue(name, false);
                        }
                      }}
                      checked={values[name as keyof FormikValues]}
                      label={text(label as LocalKeys)}
                    />
                  ))}
                </FormGroup>
              </FormControl>

              <Box sx={{ display: "flex", columnGap: 2 }}>
                <FormFooter
                  handleClose={onCancel}
                  loading={submitLoading}
                  cancelText={text("add_reserved_vault_cancel_title")}
                  submitText={text("inquiry_page_btn_send")}
                />
              </Box>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ReplyForm;
