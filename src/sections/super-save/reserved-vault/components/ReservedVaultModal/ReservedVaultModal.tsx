import { Box, Button, Typography } from "@mui/material";
import React, { useRef, ChangeEvent } from "react";
import { useLocale } from "locale";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import CustomDialog from "@common/components/CustomDialog";
import * as Yup from "yup";
import TextFieldInput from "@common/components/FormInputs/TextField";
import DatesField from "@common/components/FormInputs/DatesField";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import FormFooter from "@common/components/FormFooter";

export type ReservedVaultModalFormType = {
  confirmationDate: string;
  accountNumber: string;
  bank: string;
  bankCertificateUrl: null | FileList | string;
  accountBalance: number;
  id: string;
};

type ReservedModalPropTypes = {
  type: string;
  submit: (
    props: ReservedVaultModalFormType,
    onSuccess: () => void,
  ) => Promise<void>;
  open: boolean;
  formData?: ReservedVaultModalFormType;
  handleClose: () => void;
  formType: "Edit" | "Add";
  loading: boolean;
};

const defaultInitialValues = {
  accountBalance: "",
  accountNumber: "",
  bank: "",
  bankCertificateUrl: "",
  confirmationDate: "",
  id: "",
};

function ReservedVaultModal({
  type,
  open = false,
  submit,
  formData,
  handleClose,
  formType,
  loading,
}: ReservedModalPropTypes) {
  const { text } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialValues = () =>
    formType === "Edit" && formData ? formData : defaultInitialValues;

  const onSubmit = async (data: any) => {
    if (!data.bankCertificateUrl) {
      toast.error(text("toast_error_image_is_required"));
    } else {
      submit(data, handleClose);
    }
  };

  function getValidationSchema() {
    const string_v = requiredStringValidator(
      ["accountBalance", "accountNumber", "bank", "bankCertificateUrl"],
      text("form_error_required"),
    );

    return Yup.object().shape({
      ...string_v,
      confirmationDate: Yup.date()
        .nullable()
        .required(text("form_error_required"))
        .typeError(text("form_error_invalid_date")),
    });
  }
  
  function getTitle() {
    const st =
      text(
        formType === "Add"
          ? "add_reserved_vault_type_add"
          : "add_reserved_vault_type_edit",
      ) + "\t";

    const et = text("reserved_vault_add_reserved_vault_title");

    return st + et;
  }

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  function trimImageName(file: any) {
    if (typeof file === "string") {
      return file.length > 20 ? file.slice(0, 20) + "..." : file;
    }

    const parts = file[0]?.name?.split(".");
    const extension = parts?.pop();
    const nameWithoutExtension = parts?.join(".");

    const fileName =
      nameWithoutExtension?.length > 15
        ? nameWithoutExtension?.slice(0, 15) + ".."
        : nameWithoutExtension;

    return [fileName, extension]?.join(".");
  }

  return (
    <CustomDialog open={open} onClose={handleClose} titleText={getTitle()}>
      <Box>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={getValidationSchema()}
          onSubmit={(values) => onSubmit(values)}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({
            values,
            errors,
            touched,
            getFieldProps,
            setFieldTouched,
            setFieldValue,
          }) => {
            function fieldProps(field: string) {
              //eslint-disable-next-line  @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const error = touched[field] && Boolean(errors[field]);
              //eslint-disable-next-line  @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const helperText = touched[field] && errors[field];
              return { error, helperText, ...getFieldProps(field) };
            }

            const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
              const selectedFile = event.target.files
                ? event.target.files
                : null;
              if (selectedFile) {
                setFieldValue("bankCertificateUrl", selectedFile);
              }
            };
            return (
              <Form>
                <Box
                  sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}
                >
                  <Box>
                    <label className="block mb-2 text-sm font-medium text-slate-500">
                      {type === "KWR"
                        ? text("add_reserved_vault_bank_certification")
                        : text("add_reserved_vault_transaction_certification")}
                    </label>
                    <Button
                      onClick={handleButtonClick}
                      variant="outlined"
                      startIcon={
                        !values.bankCertificateUrl && <CloudUploadIcon />
                      }
                      endIcon={
                        values.bankCertificateUrl && (
                          //eslint-disable-next-line  @typescript-eslint/ban-ts-comment
                          //@ts-ignore
                          <CloseIcon
                            onClick={(event: Event) => {
                              event.stopPropagation();
                              setFieldValue("bankCertificateUrl", "");
                            }}
                          />
                        )
                      }
                      sx={{
                        width: 200,
                        borderColor:
                          touched.bankCertificateUrl &&
                          errors.bankCertificateUrl
                            ? "red!important"
                            : "default",
                        color:
                          touched.bankCertificateUrl &&
                          errors.bankCertificateUrl
                            ? "red!important"
                            : "default",
                      }}
                    >
                      {values.bankCertificateUrl
                        ? trimImageName(values.bankCertificateUrl)
                        : text("add_ads_management_upload_btn_text")}
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/bmp, image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {touched.bankCertificateUrl &&
                      errors.bankCertificateUrl && (
                        <Typography
                          color="error"
                          sx={{ mt: 1, fontSize: "12px" }}
                        >
                          {errors.bankCertificateUrl}
                        </Typography>
                      )}
                  </Box>
                  <TextFieldInput
                    placeholder={text(
                      "add_reserved_vault_bank_name_placeholder",
                    )}
                    label={text("add_reserved_vault_bank_name")}
                    {...fieldProps("bank")}
                  />

                  <TextFieldInput
                    placeholder={
                      type === "KWR"
                        ? text("add_reserved_vault_account_number")
                        : text("add_reserved_vault_vault_id")
                    }
                    label={
                      type === "KWR"
                        ? text("add_reserved_vault_account_number")
                        : text("add_reserved_vault_vault_id")
                    }
                    {...fieldProps("accountNumber")}
                  />

                  <TextFieldInput
                    placeholder={
                      type === "KWR"
                        ? text("add_reserved_vault_account_balance")
                        : text("add_reserved_vault_vault_balance")
                    }
                    label={
                      type === "KWR"
                        ? text("add_reserved_vault_account_balance")
                        : text("add_reserved_vault_vault_balance")
                    }
                    type="number"
                    {...fieldProps("accountBalance")}
                  />

                  <DatesField
                    label={text("add_reserved_vault_confirmation_date")}
                    error={
                      touched.confirmationDate &&
                      Boolean(errors.confirmationDate)
                    }
                    helperText={
                      touched.confirmationDate && errors.confirmationDate
                    }
                    onBlur={() =>
                      !values.confirmationDate ||
                      !dayjs(values.confirmationDate).isValid()
                        ? setFieldTouched("confirmationDate", true)
                        : null
                    }
                    onChange={(event) => {
                      setFieldValue(
                        "confirmationDate",
                        event ? dayjs(event).format("YYYY-MM-DD") : null,
                      );
                    }}
                    {...(formType === "Edit" && formData
                      ? { value: dayjs(formData.confirmationDate) }
                      : {})}
                  />

                  <Box sx={{ display: "flex", columnGap: 2 }}>
                    <FormFooter
                      handleClose={handleClose}
                      loading={loading}
                      cancelText={text("add_reserved_vault_cancel_title")}
                      submitText={text("add_reserved_vault_save")}
                    />
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </CustomDialog>
  );
}

export default ReservedVaultModal;
