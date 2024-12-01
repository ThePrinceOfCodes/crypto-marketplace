import { Alert, Box, Button, FormHelperText } from "@mui/material";
import { useLocale } from "locale";
import React, { ChangeEvent, useRef } from "react";
import { ITransferOwnershipDepositRequestRsq, useTransferOwnershipDepositRequest } from "api/hooks";
import { toast } from "react-toastify";
import { TransferOwnerShipModal as ModalType } from "./types";
import CustomDialog from "@common/components/CustomDialog";
import { Formik, Form } from "formik";
import { requiredEmailValidator, requiredFileValidator } from "@common/utils/validationSchemas";
import * as Yup from "yup";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const TransferOwnerShipModal: React.FC<ModalType> = ({ requestId, open, handleClose, handleSubmit }) => {

  const { mutateAsync: transferOwnershipDepositRequest, isLoading } = useTransferOwnershipDepositRequest();
  const { text } = useLocale();

  const fileInputRef = useRef<any | null>(null);

  const onSubmit = async (data: ITransferOwnershipDepositRequestRsq) => {
    transferOwnershipDepositRequest({
      ...data
    }).then(res => {
      toast.success(res?.result);
      handleSubmit?.();
      handleClose();

    }).catch(err => {
      toast.error(err?.response?.data?.result || err?.response?.data?.error || "Error");
    });
  };

  const validationSchema = () => {
    const email = requiredEmailValidator(["email"], text("form_invalid_email"), text("form_email_required"));
    const file = requiredFileValidator(["file"], text("form_pdf_required"), text("form_pdf_file_only_accept"),);

    return Yup.object().shape({
      ...email, ...file
    });
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={text("deposit_information_transfer_modal_title")}
    >
      <Formik
        validationSchema={validationSchema()}
        initialValues={{ email: "", file: null, request_id: requestId }}
        onSubmit={(values) => onSubmit(values)}
        validateOnBlur={false}
      >
        {({ values, errors, touched, getFieldProps, setFieldValue }) => {

          const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = event.target.files
              ? event.target.files[0]
              : null;
            if (selectedFile) {
              setFieldValue("file", selectedFile);
            }
          };

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                <Box>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-500 mb-2"
                  >
                    {text("deposit_information_transfer_modal_email_label")}

                  </label>

                  <TextFieldInput
                    placeholder={text("deposit_information_transfer_modal_email_placeholder")}
                    error={touched["email"] && Boolean(errors["email"])}
                    helperText={touched["email"] && errors["email"]}
                    {...getFieldProps("email")}
                  />
                </Box>

                <Box>
                  <label className="block mb-2 text-sm font-medium text-slate-500">
                    {text("deposit_information_transfer_modal_file_label")}
                  </label>
                  <Box>
                    <Button
                      sx={{
                        borderColor: `${touched.file && errors.file ? "error.main" : ""}`,
                        "&:hover": {
                          border: `${touched.file && errors.file ? "1px solid #d32f2f" : ""}`,
                        }
                      }}
                      onClick={handleButtonClick}
                      variant="outlined"
                      startIcon={!values.file && <CloudUploadIcon />}
                      endIcon={
                        values.file && (
                          <CloseIcon
                            onClick={(event: any) => {
                              event.stopPropagation();
                              setFieldValue("file", null);
                              fileInputRef.current.value = "";
                            }}
                          />
                        )
                      }
                      className="w-full truncate"
                    >
                      <span className="block overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {values.file
                          ? //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-ignore
                          values.file.name
                          : text("add_ads_management_upload_btn_text")}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {touched.file && errors.file && (
                      <FormHelperText sx={{ color: "#d32f2f", marginLeft: "4px", marginTop: "4px" }} >{errors.file}</FormHelperText>
                    )}
                  </Box>
                  <Box className="mt-[30px]">
                    <div >
                      <Alert severity="warning">{text("deposit_information_transfer_modal_alert")}</Alert>
                    </div>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    handleClose={handleClose}
                    loading={isLoading}
                    cancelText={text("deposit_information_transfer_modal_cancel")}
                    submitText={text("deposit_information_transfer_modal_submit")}
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

export default TransferOwnerShipModal;
