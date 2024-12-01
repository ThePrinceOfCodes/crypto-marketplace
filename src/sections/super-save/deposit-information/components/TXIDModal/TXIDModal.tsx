import * as Yup from "yup";
import React from "react";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { Formik, Form } from "formik";
import { usePostDepositTransactionID } from "api/hooks";
import { toast } from "react-toastify";
import { useLocale } from "locale";
import { Box } from "@mui/material";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import { htmlIds } from "@cypress/utils/ids";
import { TXIDModalType } from "@sections/super-save/deposit-information/components/TXIDModal/types";
import FormFooter from "@common/components/FormFooter";
const TXIDModal: React.FC<{
  open: boolean;
  onClose: () => void;
  tXIDModal: TXIDModalType;
  refetchDeposit: () => void;
}> = ({ open, onClose, tXIDModal, refetchDeposit }) => {
  const { text } = useLocale();

  const { mutateAsync: createDepositTransaction, isLoading } =
    usePostDepositTransactionID();

  function validationSchema() {
    const hexPattern = /^0x([A-Fa-f0-9]{64})$/;
    return Yup.object().shape({
      value: Yup.string()
        .required(text("form_error_required"))
        .matches(hexPattern, "Invalid Format")
    });
  }

  const onSubmit = async (values: { value: string }) => {
    const formData = {
      request_id: tXIDModal.requestId,
      [tXIDModal.name]: values.value,
    };

    createDepositTransaction(formData)
      .then((res) => {
        toast(res?.data?.result || "Success", {
          type: "success",
        });
        refetchDeposit();
        onClose();
      })
      .catch((err) => {
        toast(
          err?.response?.data?.result ||
            err?.response?.data?.message ||
            "Error",
          {
            type: "error",
          },
        );
      });
  };

  return (
    <>
      <CustomDialog
        open={open}
        onClose={onClose}
        titleText={tXIDModal.modalTitle}
      >
        <Formik
          initialValues={{ value: "" }}
          validationSchema={validationSchema()}
          onSubmit={onSubmit}
        >
          {({ touched, errors, getFieldProps }) => (
            <Form>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 4,
                  marginTop: "10px",
                  paddingY: "10px",
                }}
              >
                <TextFieldInput
                  error={touched.value && Boolean(errors.value)}
                  helperText={touched.value && errors.value}
                  placeholder=""
                  label={tXIDModal.label}
                  {...getFieldProps("value")}
                  id={htmlIds.input_deposit_information_txid}
                  variant="outlined"
                />
                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    loading={isLoading}
                    handleClose={onClose}
                    submitText={text("deposit_information_txid_submit_button")}
                    cancelText={text("deposit_information_txid_cancel_button")}
                  />
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </CustomDialog>
    </>
  );
};

export default TXIDModal;
