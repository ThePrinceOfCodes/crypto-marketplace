import { useLocale } from "locale";
import {
  Alert,
  Box,
} from "@mui/material";
import React from "react";
import { usePostRefundQrTransaction } from "api/hooks/transaction";
import { queryClient } from "api";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { Form, Formik } from "formik";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";
import { requiredNumbervalidator } from "@common/utils/validationSchemas";


const PDRefundModal: React.FC<{
  open: boolean;
  onSubmit: () => void;
  transactionId: string;
  onClose: () => void;
}> = ({ open, transactionId, onClose: _onClose, onSubmit }) => {
  const { text } = useLocale();

  const { mutateAsync: postRefundQrTransaction, isLoading } =
    usePostRefundQrTransaction();

  const onClose = () => {
    _onClose();
    onSubmit();
  };

  function validationSchema() {
    return Yup.object().shape(
      requiredNumbervalidator(["amountFee"], text("refund_modal_amount_error")),
    );
  }

  const handleSubmit = async (values :any ) => {
    const feePercentage =values.amountFee;
    if (feePercentage !== null && feePercentage >= 0 && feePercentage <= 99) {
      postRefundQrTransaction({ feePercentage, transactionId })
        .then(() => {
          queryClient.invalidateQueries(["list-transactions"]);
          toast.success("Successfully refunded");
          onClose();
        })
        .catch((err) => {
          toast.error(err?.response?.data?.msg);
        });
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("refund_modal_title")}
    >

      <Formik
        initialValues={{ amountFee: null }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema()}
        validateOnBlur={false}
      >
        {({ errors, touched, getFieldProps }) => {
          //eslint-disable-next-line react-hooks/rules-of-hooks
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
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <TextFieldInput
                  type="number"
                  label={text("refund_modal_label")}
                  placeholder={text("refund_modal_amount_placeholder")}
                  {...fieldProps("amountFee")}
                />
                <Alert severity="warning">{text("refund_modal_alert_message")}</Alert>

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={onClose}
                    loading={isLoading}
                    cancelText={text("add_platform_cancel_btn_text")}
                    submitText={text("add_platform_submit_btn_text")}
                  />
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </CustomDialog>
  );
};

export default PDRefundModal;
