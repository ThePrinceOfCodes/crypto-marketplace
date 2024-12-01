import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText, Spinner } from "@common/components";
import { htmlIds } from "@cypress/utils/ids";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Alert, Button } from "@mui/material";
import { useLocale } from "locale";
import React, { useEffect, useState } from "react";
import {
  IApproveTransferOwnershipRequestRsq,
  useApproveTransferOwnershipRequest,
} from "api/hooks";
import { toast } from "react-toastify";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

interface ApproveTransferOwnershipProps {
  transfer_id: string;
  onUpdated?: () => void;
}

const ApproveTransferOwnership = (props: ApproveTransferOwnershipProps) => {
  const { transfer_id, onUpdated } = props;
  const { mutateAsync: approveTransferRequest, isLoading } =
    useApproveTransferOwnershipRequest();
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<IApproveTransferOwnershipRequestRsq>({
    transfer_id: "",
    file: null,
  });

  const onSubmit = async (values: { file: File | null }) => {
    if (!values.file) {
      return; // No file selected
    }

    approveTransferRequest({
      ...data,
      file: values.file,
    })
      .then((res) => {
        toast.success(res?.result || "Successfully Approved");
        onUpdated?.();
        handleClose();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.result || err?.response?.data?.error || "Error",
        );
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setData({
      ...data,
      transfer_id,
    });
  }, [transfer_id]);

  return (
    <>
      <button
        id={htmlIds.btn_platforms_request_approve_request}
        className={
          "flex items-center justify-center text-sm text-green-600 border-solid border-2 border-green-600	bg-green-100 rounded-full h-8 w-8 underline decoration-solid ml-2"
        }
        onClick={() => setOpen(true)}
      >
        <span>
          {isLoading ? <Spinner /> : <CheckIcon className="w-5 stroke-2" />}
        </span>
      </button>
      <CustomDialog
        open={open}
        onClose={() => handleClose()}
        titleText={text("approve_transfer_ownership_modal_title")}
      >
        <Formik
          initialValues={{ file: null }}
          validationSchema={Yup.object().shape({
            file: Yup.mixed().test("fileType", text("deposit_information_transfer_modal_pdf"), (value) => {
              if (!value) return false; // allow empty values
               return value instanceof File && value.type === "application/pdf";})
              .required(text("form_error_required")),
            })}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              onSubmit(values);
              setSubmitting(false);
            }, 400);
          }}
        >
          {({ isSubmitting, errors, }) => (
            <Form>
              <div className="flex flex-col space-y-3 py-3">
                <Field
                  name="file"
                  render={({ field, form }: any) => (
                    <InputText
                      type="file"
                      name={field.name}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        const file = event.target.files?.[0];
                        form.setFieldValue(field.name, file);
                      }}
                      className={`rounded-lg border text-sm px-4 py-2 ${
                        errors.file
                          ? "border-red-500"
                          : "border-black"
                      }`}
                      labelText="deposit_information_transfer_modal_file_label"
                    />
                  )}
                />
                <ErrorMessage
                  name="file"
                  component="div"
                  className="text-red-500 text-xs"
                />
              </div>
              <div className="mt-2 mb-6">
                <Alert severity="warning">
                  {text("deposit_information_transfer_modal_alert")}
                </Alert>
              </div>
              <div className="flex mt-3 gap-2 justify-center">                
                <FormFooter
                  handleClose={handleClose}
                  loading={isSubmitting}
                  cancelText={text("deposit_information_transfer_modal_cancel")}
                  submitText={text("deposit_information_transfer_modal_submit")}
                  cancelBtnId={htmlIds.btn_set_standard_amount_cancel}
                  submitBtnId={htmlIds.btn_set_standard_amount_save}
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </CustomDialog>
    </>
  );
};

export default ApproveTransferOwnership;
