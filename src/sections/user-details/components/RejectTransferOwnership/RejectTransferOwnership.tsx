import { Spinner } from "@common/components";
import { htmlIds } from "@cypress/utils/ids";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Alert, Box, TextareaAutosize } from "@mui/material";
import { useLocale } from "locale";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  IRejectTransferOwnershipRequestRsq,
  useRejectTransferOwnershipRequest,
} from "../../../../api/hooks";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { requiredStringValidator } from "@common/utils/validationSchemas";

interface RejectTransferOwnershipProps {
  transfer_id: string;
  onUpdated?: () => void;
}

const RejectTransferOwnership = (props: RejectTransferOwnershipProps) => {
  const { transfer_id, onUpdated } = props;
  const { mutateAsync: rejectTransferRequest, isLoading } =
    useRejectTransferOwnershipRequest();

  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  // const [remark, setRemark] = useState<string>("");
const [data, setData] = useState<IRejectTransferOwnershipRequestRsq>({
    transfer_id: "",
    remark: "",
  });

  const handleClose = () => {
    setOpen(false);
  };

  // const validationSchema = Yup.object({
  //   remark: Yup.string()
  //     .required("Remark is required")
  //     .min(10, "Remark must be at least 10 characters"),
  // });
  const validationSchema = () => {
    const string_v = requiredStringValidator(
      ["remark"],
      text("form_error_required"),
    );

    return Yup.object().shape({ ...string_v });
  };

  const initialValues = { remark: "" };

  const onSubmit = async (values: { remark: string }) => {
    try {
      const res = await rejectTransferRequest({
        transfer_id,
        remark: values.remark,
      });
      toast.success(res?.result || "Successfully Rejected");
      onUpdated?.();
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.result ||
          err?.response?.data?.error ||
          err.message ||
          "Error"
      );
    }
  };

  // useEffect(() => {
  //   setRemark(""); // Reset remark field when transfer_id changes
  // }, [transfer_id]);
  useEffect(() => {
    setData({
      ...data,
      transfer_id,
    });
  }, [transfer_id]);

  return (
    <>
      <button
        id={htmlIds.btn_platforms_request_decline_request}
        className={
          "flex items-center justify-center text-sm text-red-600 border-solid border-2 border-red-600 bg-red-100 rounded-full h-8 w-8 underline decoration-solid"
        }
        onClick={() => {
          setOpen(true);
        }}
      >
        <span>
          {isLoading ? <Spinner /> : <XMarkIcon className="w-5 stroke-2" />}
        </span>
      </button>
      <CustomDialog
        open={open}
        onClose={() => handleClose()}
        titleText={text("reject_transfer_ownership_modal_title")}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({handleSubmit,touched,errors,isValid,getFieldProps }) => (
            <Form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2}}>
              <TextFieldInput
                error={touched["remark"] && Boolean(errors["remark"])}
                helperText={touched["remark"] && errors["remark"]}
                placeholder={text("payment_apply_modal_enter_reason_placeholder")}
                label={text("payment_apply_modal_enter_reason_placeholder")}
                multiline
                rows={4}
                {...getFieldProps("remark")}
              />
              <div className={"mt-2 mb-6"}>
                <Alert severity="warning">
                  {text("reject_transfer_ownership_modal_alert")}
                </Alert>
              </div>
              <Box sx={{ display: "flex", columnGap: 2 }}>
                <FormFooter
                  handleClose={handleClose}
                  loading={isLoading}
                  cancelText={text("deposit_information_transfer_modal_cancel")}
                  submitText={text("deposit_information_transfer_modal_submit")}
                  cancelBtnId={htmlIds.btn_set_standard_amount_cancel}
                  submitBtnId={htmlIds.btn_set_standard_amount_save}
                  disabled={!isValid || isLoading}
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

export default RejectTransferOwnership;
