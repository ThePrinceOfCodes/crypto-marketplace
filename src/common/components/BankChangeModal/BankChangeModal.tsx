import {
  Box,
} from "@mui/material";
import React, { Fragment } from "react";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import CustomDialog from "@common/components/CustomDialog";
import { Formik, Form, } from "formik";
import { requiredAccoutNumberValidator, requiredFileValidator, requiredStringValidator } from "@common/utils/validationSchemas";
import * as Yup from "yup";
import FormFooter from "@common/components/FormFooter";
import TextFieldInput from "@common/components/FormInputs/TextField";
import AutoCompleteField from "../FormInputs/AutoComplete";
import FileInput from "../FormInputs/FileInput";

export type BankChangeModalFormType = {
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  bankStatementFile: null | Blob;
};

type BankChangeModalPropType = {
  submit: (
    props: BankChangeModalFormType
  ) => Promise<void>;
  open: boolean;
  handleClose: () => void;
  formType: "Add";
  isLoading: boolean
};

function BankChangeModal({
  open = false,
  submit,
  handleClose,
  isLoading
}: BankChangeModalPropType) {
  const { text } = useLocale();

  const validationSchema = () => {
    const bankAccountNumber = requiredAccoutNumberValidator(["bankAccountNumber"], text(
      "user_update_modal_tile_type_corporate_bank_account_number_error"), text("form_error_required_corporate_bank_account_digit_format"));

    const bankAccountHolderName = requiredStringValidator(["bankAccountHolderName"], text(
      "user_update_modal_tile_type_corporate_bank_account_holder_name_error",
    ),);

    const bankName = requiredStringValidator(
      ["bankName"], text("user_update_modal_tile_type_corporate_bank_name_error")
    );

    // const bankStatementFile = requiredFileValidator(["bankStatementFile"], text("add_reserved_vault_bank_certification_validation"), text("form_pdf_file_only_accept"),);

    return Yup.object().shape({ ...bankAccountNumber, ...bankAccountHolderName, ...bankName, bankStatementFile: Yup.mixed().required(text("add_reserved_vault_bank_certification_validation")) });
  };

  const getInitialValue = () => {
    return {
      bankName: "",
      bankAccountNumber: "",
      bankAccountHolderName: "",
      bankStatementFile: null,
    };
  };

  return (
    <Fragment>
      <CustomDialog
        open={open}
        onClose={handleClose}
        titleText={text("corporate_user_details_change_bank_account")}
      >
        <Formik
          validationSchema={validationSchema()}
          initialValues={getInitialValue()}
          onSubmit={(values) => submit(values)}
          validateOnBlur={false}
        >
          {({ errors, touched, getFieldProps, setFieldValue }) => {

            function fieldProps(field: string) {
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const error = touched[field] && Boolean(errors[field]);
              //eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const helperText = touched[field] && errors[field];
              return { error, helperText, setFieldValue, ...getFieldProps(field) };
            }

            return (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                  <Box>
                    <label
                      className="block text-sm font-medium text-slate-500 mb-2"
                    >
                      {text("user_column_header_corporate_bank")}
                    </label>

                    <AutoCompleteField
                      placeholder={text(
                        "user_column_header_corporate_bank_placeholder",
                      )}                     
                      options={bankInfo.map(
                        (bank: string) => bank,
                      )}
                      error={
                        touched["bankName"] && Boolean(errors["bankName"])
                      }
                      helperText={touched["bankName"] && errors["bankName"]}
                      onChange={(event: Event, newValue: string) => {
                        setFieldValue("bankName", newValue);
                      }}
                    />
                  </Box>

                  <Box>
                    <label
                      className="block text-sm font-medium text-slate-500 mb-2"
                    >
                      {text("user_column_header_corporate_bank_account_no")}
                    </label>

                    <TextFieldInput
                      id={htmlIds.input_bank_change_vault_modal_bank_account_number}
                      placeholder={text("user_column_header_corporate_bank_account_no")}
                      {...fieldProps("bankAccountNumber")}
                    />
                  </Box>

                  <Box>
                    <label
                      className="block text-sm font-medium text-slate-500 mb-2"
                    >
                      {text("user_column_header_corporate_bank_account_holder")}
                    </label>

                    <TextFieldInput
                      id={htmlIds.input_bank_change_vault_modal_bank_account_holder_name}
                      placeholder={text("user_column_header_corporate_bank_account_holder")}
                      {...fieldProps("bankAccountHolderName")}
                    />
                  </Box>

                  <FileInput
                    name="bankStatementFile"
                    label={text("user_column_header_corporate_bankbook")}
                    uploadFileText={text("add_ads_management_upload_btn_text")}
                    errorText={errors["bankStatementFile"]}
                  />

                  <Box sx={{ display: "flex", columnGap: 2 }}>
                    <FormFooter
                      handleClose={handleClose}
                      loading={isLoading}
                      cancelText={text("add_reserved_vault_cancel_title")}
                      submitText={text("add_reserved_vault_save")}
                    />
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomDialog>
    </Fragment>
  );
}

export default BankChangeModal;

const bankInfo = [
  "NH농협",
  "카카오뱅크",
  "KB국민은행",
  "신한은행",
  "우리은행",
  "토스뱅크",
  "IBK기업은행",
  "하나은행",
  "새마을금고",
  "BNK부산은행",
  "DGB대구은행",
  "케이뱅크",
  "신협은행",
  "우체국예금",
  "SC제일은행",
  "BNK경남은행",
  "광주은행",
  "수협",
  "전북은행",
  "저축은행",
  "제주은행",
  "한국씨티은행",
  "KDB산업은행",
  "산림조합중앙회",
  "SBI저축은행",
  "BOA",
  "중국은행",
  "HSBC",
  "중국공상은행",
  "도이치뱅크",
  "JP모건",
  "BNP파리바은행",
  "중국건설은행",
  "미래에셋증권",
  "삼성증권",
  "KB증권",
  "한국투자증권",
  "키움증권",
  "대신증권",
  "NH투자증권",
];
