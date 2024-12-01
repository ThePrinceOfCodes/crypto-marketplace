import * as Yup from "yup";
import { useDialog } from "@common/context";
import { Alert, Box } from "@mui/material";
import {
  TransferModalProps,
  TransferModalRef,
} from "@sections/user-details/components";
import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { usePostExchangeUserId } from "../../../../api/hooks";
import { useLocale } from "../../../../locale";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { requiredEmailValidator, requiredPhoneValidator } from "@common/utils/validationSchemas";

const TransferModal = (
  props: TransferModalProps,
  ref: Ref<TransferModalRef>,
) => {
  const [open, setOpen] = useState(false);
  const { text } = useLocale();
  const { email, onSave } = props;

  const { mutateAsync: exChangeUserIdAction, isLoading: submitting } =
    usePostExchangeUserId();
  const { confirmDialog } = useDialog();

  const onClose = () => {
    setOpen(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const validationSchema = () => {
    const new_user_email = requiredEmailValidator(["new_user_email"], text("form_invalid_email"), text("form_email_required"));
    return Yup.object().shape({
      ...new_user_email,
      phone_number: requiredPhoneValidator(text("form_error_phone_required")),
    });
  };

  const initialValues = {
    new_user_email: "",
    phone_number: "",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    confirmDialog({
      title: text("user_details_basic_tab_transfer_confirmation_modal_title"),
      onOk: async () => {
        exChangeUserIdAction({
          old_user_email: email,
          new_user_email: data.new_user_email,
          phone_number: data.phone_number?.replace(/\D/g, ""),
        })
          .then((res) => {
            toast.success(res?.data.message);
            onSave && onSave();
            onClose();
          })
          .catch((error) => toast.error(error?.response?.data?.result || error?.response?.data?.error));
      },
    });
  };

  return (
    <div>
      <CustomDialog
        open={open}
        onClose={onClose}
        titleText={text("user_details_basic_tab_transfer")}
      >
        <Formik
          onSubmit={(values) => onSubmit(values)}
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ getFieldProps, touched, errors }) => {
            function fieldProps(field: string) {
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const error = touched[field] && Boolean(errors[field]);
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const helperText = touched[field] && errors[field];

              return { error, helperText, ...getFieldProps(field) };
            }
            return (
              <Form>
                <Box
                  sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
                >
                  <TextFieldInput
                    placeholder={text(
                      "user_details_basic_tab_transfer_modal_new_user_email_placeholder",
                    )}
                    label={text(
                      "user_details_basic_tab_transfer_modal_new_user_email",
                    )}
                    {...fieldProps("new_user_email")}
                  />
                  <TextFieldInput
                    placeholder={text(
                      "user_details_basic_tab_transfer_modal_new_user_phone_placeholder",
                    )}
                    label={text(
                      "user_details_basic_tab_transfer_modal_new_user_phone",
                    )}
                    {...fieldProps("phone_number")}
                  />

                  <Alert className="my-2" severity="warning">
                    {text(
                      "user_details_basic_tab_transfer_confirmation_modal_content",
                    )}
                  </Alert>

                  <Box sx={{ display: "flex", columnGap: 2 }}>
                    <FormFooter
                      handleClose={onClose}
                      loading={submitting}
                      cancelText={text(
                        "setting_users_free_tokens_dialog_cancel_button",
                      )}
                      submitText={text(
                        "setting_users_free_tokens_dialog_submit_button",
                      )}
                    />
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomDialog>
    </div>
  );
};

export default forwardRef(TransferModal);
