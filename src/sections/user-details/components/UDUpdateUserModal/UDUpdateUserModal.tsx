import CustomDialog from "@common/components/CustomDialog";
import { htmlIds } from "@cypress/utils/ids";
import { Box, ListItemText, MenuItem } from "@mui/material";
import { queryClient } from "api";
import {
  IPostCreateUserWalletDetailsErr,
  iPostUpdateUserBankDetailsErr,
  iPostUpdateUserNameErr,
  iPostUpdateUserPhoneNumberErr,
  IPostUpdateUserWalletDetailsErr,
  iPostUpdateUserEmailErr,
  iPostUpdateCorporateNameErr,
  usePostAddUserBankDetails,
  usePostCreateUserWalletDetails,
  usePostUpdateUserBankDetails,
  usePostUpdateUserBankDetailsById,
  usePostUpdateUserName,
  usePostUpdateCorporateName,
  usePostUpdateUserPhoneNumber,
  usePostUpdateUserEmail,
  usePostUpdateUserWalletDetails,
  usePostUpdateCorporateBankAccHolderName,
  usePostUpdateCorporateRegistrationNumber,
  iPostUpdateCorporateRegistrationNumberErr,
} from "api/hooks";
import { useLocale } from "locale";
import React from "react";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import * as Yup from "yup";
import { requiredEmailValidator, requiredPhoneValidator, requiredStringValidator } from "@common/utils/validationSchemas";
import SelectField from "@common/components/FormInputs/SelectField";

const UDUpdateUserModal: React.FC<{
  open: boolean;
  userId: string;
  existingValues: [string | null, number | string | null];
  type:
    | "name"
    | "email"
    | "corporateName"
    | "corporateBankHolderName"
    | "corporateRegistrationNumber"
    | "phoneNumber"
    | "bankName"
    | "usdt_wallet";
  onClose: () => void;
  createForm?: boolean;
  tab?: string;
  updateId?: string | null;
}> = ({
  open,
  type,
  userId,
  onClose: _onClose,
  existingValues,
  createForm = false,
  tab = "basicInformation",
  updateId = null,
}) => {
  const { text } = useLocale();

  const validationSchemaBankName = () =>
    Yup.object().shape({
      bank_name: Yup.string().required(text("form_error_bank_name_required")),
      bank_account_number: Yup.string()
        .matches(
          /^\d{11,16}$/,
          text("form_error_required_account_digit_format"),
        )
        .required(text("form_error_bank_account_number_required")),
    });

  const createValidationSchema = (field: any, errorText?: any) =>
    Yup.object().shape(requiredStringValidator([field], errorText));

  const validationSchemaPhoneNumber = () =>
    Yup.object().shape({
      number: requiredPhoneValidator(text("form_error_phone_required")),
    });

  const validationSchemaCorporateRegistrationNumber = () =>
    Yup.object().shape({
      corporateRegistrationNumber: Yup.number().required(
        text("form_error_corporate_registration_number_required"),
      ),
    });

  const validationSchemaUSDTWallet = () =>
    createValidationSchema(
      "wallet_id",
      text("form_error_wallet_address_required"),
    );
  const validationSchemaName = () =>
    createValidationSchema("name", text("form_error_name_required"));

  const validationSchemaEmail = () => Yup.object().shape(
    requiredEmailValidator(["email"], text("form_invalid_email"), text("form_email_required"))
  )

  const validationSchemaCorporateName = () =>
    createValidationSchema(
      "corporate_name",
      text("form_error_corporate_name_required"),
    );
  const validationSchemaCorporateBankHolderName = () =>
    createValidationSchema(
      "corporateBankHolderName",
      text("form_error_corporate_bank_holder_name_required"),
    );

  interface BankNameTypes {
    bank_name: string;
    bank_account_number: any;
  }
  interface USDTWalletTypes {
    wallet_id: string;
    wallet_type_select: string;
  }
  interface NameTypes {
    name: string;
  }
  interface PhoneNumberTypes {
    number: string;
  }

  interface EmailTypes {
    email: string;
  }
  interface CorporateNameTypes {
    corporate_name: string;
  }
  interface CorporateBankHolderNameTypes {
    corporateBankHolderName: string;
  }

  interface CorporateRegistrationNumberTypes {
    corporateRegistrationNumber: string;
  }

  // Hooks
  const {
    mutateAsync: postUpdateUserPhoneNumber,
    isLoading: userPhoneNumberIsLoading,
  } = usePostUpdateUserPhoneNumber();

  const { mutateAsync: postUpdateUserName, isLoading: userNameIsLoading } =
    usePostUpdateUserName();

  const { mutateAsync: postUpdateUserEmail, isLoading: userEmailIsLoading } =
    usePostUpdateUserEmail();

  const {
    mutateAsync: postUpdateCorporateName,
    isLoading: corporateNameIsLoading,
  } = usePostUpdateCorporateName();

  const {
    mutateAsync: postUpdateCorporateBankAccHolderName,
    isLoading: corporateBankAccHolderNameIsLoading,
  } = usePostUpdateCorporateBankAccHolderName();

  const {
    mutateAsync: postUpdateCorporateRegistrationNumber,
    isLoading: corporateRegistrationNumberIsLoading,
  } = usePostUpdateCorporateRegistrationNumber();

  const {
    mutateAsync: postUpdateUserBankDetails,
    isLoading: userBankDetailsIsLoading,
  } = usePostUpdateUserBankDetails();

  const {
    mutateAsync: addUserBankDetails,
    isLoading: addUserBankDetailsIsLoading,
  } = usePostAddUserBankDetails();

  const {
    mutateAsync: postUpdateUserWalletDetails,
    isLoading: userWalletDetailsIsLoading,
  } = usePostUpdateUserWalletDetails();

  const {
    mutateAsync: postUpdateUserBankDetailsById,
    isLoading: updateUserBankDetailsByIdIsLoading,
  } = usePostUpdateUserBankDetailsById();

  const {
    mutateAsync: postCreateUserWallet,
    isLoading: isCreateUserWalletLoading,
  } = usePostCreateUserWalletDetails();

  const onClose = () => {
    _onClose();
  };

  const onSubmitUSDTWallet = ({ wallet_id }: { wallet_id: string }) => {
    if (wallet_id) {
      if (createForm) {
        postCreateUserWallet({
          user_id: userId,
          wallet_type: "USDT (Polygon Network)",
          wallet_id: wallet_id,
        })
          .then((res) => {
            queryClient.invalidateQueries(["get-user-wallet-list", userId]);
            queryClient.invalidateQueries(["super-user-details"]);
            toast(res?.data.result, { type: "success" });
            onClose();
          })
          .catch((err: IPostCreateUserWalletDetailsErr) => {
            toast(err?.response?.data?.message || err?.response?.data?.result, {
              type: "error",
            });
            onClose();
          });
      } else {
        const wallet_uuid: string = updateId ? updateId : "";
        postUpdateUserWalletDetails({
          wallet_uuid,
          user_id: userId,
          wallet_type: "USDT (Polygon Network)",
          wallet_id: wallet_id,
        })
          .then((res) => {
            queryClient.invalidateQueries(["get-user-wallet-list", userId]);
            queryClient.invalidateQueries(["super-user-details"]);
            toast(res?.data.result, { type: "success" });
            onClose();
          })
          .catch((err: IPostUpdateUserWalletDetailsErr) => {
            toast(err?.response?.data?.message || err?.response?.data?.result, {
              type: "error",
            });
            onClose();
          });
      }
    }
    return;
  };

  const onSubmitBankName = ({
    bank_name,
    bank_account_number,
  }: BankNameTypes) => {
    if (createForm && tab === "userBankDetails") {
      addUserBankDetails({
        user_id: userId,
        bank_name: bank_name,
        bank_account_number: bank_account_number.toString(),
      })
        .then((res) => {
          queryClient.invalidateQueries(["get-user-bank-list", userId]);
          queryClient.invalidateQueries(["super-user-details"]);
          if (res?.data.result === "success")
            toast(text("form_success_bank"), {
              type: "success",
            });
          onClose();
        })
        .catch((err: iPostUpdateUserBankDetailsErr) => {
          toast(err?.response?.data?.message || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    } else {
      if (tab === "userBankDetails") {
        const bank_id: string = updateId ? updateId : "";
        postUpdateUserBankDetailsById({
          user_id: userId,
          bank_name: bank_name,
          bank_account_number: bank_account_number.toString(),
          bank_id,
        })
          .then((res) => {
            queryClient.invalidateQueries(["super-user-details"]);
            queryClient.invalidateQueries(["get-user-bank-list", userId]);
            toast(res?.data.result, { type: "success" });
            onClose();
          })
          .catch((err: iPostUpdateUserBankDetailsErr) => {
            toast(err?.response?.data?.message || err?.response?.data?.result, {
              type: "error",
            });
            onClose();
          });
      } else {
        postUpdateUserBankDetails({
          user_id: userId,
          bank_name: bank_name,
          bank_account_number: bank_account_number.toString(),
        })
          .then((res) => {
            queryClient.invalidateQueries(["super-user-details"]);
            toast(res?.data.result, { type: "success" });
            onClose();
          })
          .catch((err: iPostUpdateUserBankDetailsErr) => {
            toast(err?.response?.data?.message || err?.response?.data?.result, {
              type: "error",
            });
            onClose();
          });
      }
    }
  };

  const onSubmitName = ({ name }: NameTypes) => {
    if (name) {
      postUpdateUserName({ name, user_id: userId })
        .then((res) => {
          queryClient.invalidateQueries(["super-user-details"]);
          toast(res?.data.result, { type: "success" });
          onClose();
        })
        .catch((err: iPostUpdateUserNameErr) => {
          toast(err?.response?.data?.error || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    }
    return;
  };

  const onSubmitPhoneNumber = ({ number }: PhoneNumberTypes) => {
    if (number) {
      postUpdateUserPhoneNumber({
        phone_number: number.toString(),
        user_id: userId,
      })
        .then((res) => {
          queryClient.invalidateQueries(["super-user-details"]);
          toast(res?.data.message, { type: "success" });
          onClose();
        })
        .catch((err: iPostUpdateUserPhoneNumberErr) => {
          toast(err?.response?.data?.error || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    }
    return;
  };

  const onSubmitEmail = ({ email }: EmailTypes) => {
    if (email) {
      postUpdateUserEmail({ email, user_id: userId })
        .then((res) => {
          queryClient.invalidateQueries(["super-user-details"]);
          toast(res?.data.result, { type: "success" });
          onClose();
        })
        .catch((err: iPostUpdateUserEmailErr) => {
          toast(err?.response?.data?.error || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    }
    return;
  };

  const onSubmitCorporateName = ({ corporate_name }: CorporateNameTypes) => {
    if (corporate_name) {
      postUpdateCorporateName({
        corporate_name: corporate_name,
        user_id: userId,
      })
        .then((res) => {
          queryClient.invalidateQueries(["super-user-details"]);
          toast(res?.data.result, { type: "success" });
          onClose();
        })
        .catch((err: iPostUpdateCorporateNameErr) => {
          toast(err?.response?.data?.error || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    }
    return;
  };

  const onSubmitCorporateBankHolderName = ({
    corporateBankHolderName,
  }: CorporateBankHolderNameTypes) => {
    postUpdateCorporateBankAccHolderName({
      bank_account_holder_name: corporateBankHolderName,
      user_id: userId,
    })
      .then((res) => {
        queryClient.invalidateQueries(["super-user-details"]);
        toast(res?.data.result, { type: "success" });
        onClose();
      })
      .catch((err: iPostUpdateCorporateNameErr) => {
        toast(err?.response?.data?.error || err?.response?.data?.result, {
          type: "error",
        });
        onClose();
      });
  };

  const onSubmitCorporateRegistrationNumber = ({
    corporateRegistrationNumber,
  }: CorporateRegistrationNumberTypes) => {
    if (corporateRegistrationNumber) {
      postUpdateCorporateRegistrationNumber({
        business_registration_number: corporateRegistrationNumber.toString(),
        user_id: userId,
      })
        .then((res) => {
          queryClient.invalidateQueries(["super-user-details"]);
          toast(res?.data.result, { type: "success" });
          onClose();
        })
        .catch((err: iPostUpdateCorporateRegistrationNumberErr) => {
          toast(err?.response?.data?.error || err?.response?.data?.result, {
            type: "error",
          });
          onClose();
        });
    }
    return;
  };

  const modalInfo = {
    name: {
      title: text("user_update_modal_tile_type_name"),
      inputLabel: text("user_update_modal_tile_type_name_label"),
      inputType: "text",
      inputPlaceholder: text("user_update_modal_tile_type_name_placeholder"),
      inputErrorMsg: text("user_update_modal_tile_type_name_error"),
    },
    bankName: {
      title: createForm
        ? text("user_update_modal_tile_type_bank_info_created_form")
        : text("user_update_modal_tile_type_bank_info"),
      inputLabel: text("user_update_modal_tile_type_bank_name_label"),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_bank_name_placeholder",
      ),
      inputErrorMsg: text("user_update_modal_tile_type_bank_name_error"),
    },
    phoneNumber: {
      title: text("user_update_modal_tile_type_phone_number"),
      inputLabel: text("user_update_modal_tile_type_phone_number_label"),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_phone_number_placeholder",
      ),
      inputErrorMsg: text("user_update_modal_tile_type_phone_number_error"),
    },
    corporateRegistrationNumber: {
      title: text("user_update_modal_tile_type_corporate_registration_number"),
      inputLabel: text(
        "user_update_modal_tile_type_corporate_registration_number_label",
      ),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_corporate_registration_number_placeholder",
      ),
      inputErrorMsg: text(
        "user_update_modal_tile_type_corporate_registration_number_error",
      ),
    },
    email: {
      title: text("user_update_modal_tile_type_email"),
      inputLabel: text("user_update_modal_tile_type_email_label"),
      inputType: "text",
      inputPlaceholder: text("user_update_modal_tile_type_email_placeholder"),
      inputErrorMsg: text("user_update_modal_tile_type_email_error"),
    },
    corporateName: {
      title: text("user_update_modal_tile_type_corporate_name"),
      inputLabel: text("user_update_modal_tile_type_corporate_name_label"),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_corporate_name_placeholder",
      ),
      inputErrorMsg: text("user_update_modal_tile_type_corporate_name_error"),
    },
    corporateBankHolderName: {
      title: text(
        "user_update_modal_tile_type_corporate_bank_account_holder_name",
      ),
      inputLabel: text(
        "user_update_modal_tile_type_corporate_bank_account_holder_name_label",
      ),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_corporate_bank_account_holder_name_placeholder",
      ),
      inputErrorMsg: text(
        "user_update_modal_tile_type_corporate_bank_account_holder_name_error",
      ),
    },
    accountNumber: {
      title: text("user_update_modal_tile_type_bank_info"),
      inputLabel: text("user_update_modal_tile_type_bank_account_number_label"),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_bank_account_number_placeholder",
      ),
      inputErrorMsg: text(
        "user_update_modal_tile_type_bank_account_number_error",
      ),
    },
    usdt_wallet: {
      title: createForm
        ? text("user_update_modal_tile_type_wallet_id_create_form")
        : text("user_update_modal_tile_type_wallet_id"),
      inputLabel: text("user_update_modal_tile_type_user_wallet_id"),
      inputType: "text",
      inputPlaceholder: text(
        "user_update_modal_tile_type_wallet_id_place_holder",
      ),
      inputErrorMsg: text("user_update_modal_tile_type_wallet_id_error"),
    },
  };

  const currModalInfo = modalInfo[type];

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={`${currModalInfo.title}`}
      maxWidth={type === "corporateBankHolderName" ? "sm" : "xs"}
      className={
        type === "corporateBankHolderName" ? "custom-dialog-width-500" : ""
      }
    >
      <Box sx={{ paddingTop: 2 }}>
        {type === "usdt_wallet" && (
          <Formik
            onSubmit={(val) => onSubmitUSDTWallet(val)}
            initialValues={{
              wallet_id: "",
              wallet_type_select: "USDT (Polygon Network)",
            }}
            validationSchema={validationSchemaUSDTWallet()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof USDTWalletTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues) {
                    setFieldValue("wallet_id", existingValues[0]);
                    setFieldValue(
                      "bank_account_number",
                      "USDT (Polygon Network)",
                    );
                  }
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <SelectField
                      variant="outlined"
                      label={text("wallet_type_select")}
                      {...fieldProps(htmlIds.wallet_type_select)}
                      readOnly={true}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          color: "black", // Text color
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "black", // Border color
                        },
                        "& .MuiInputLabel-root.Mui-disabled": {
                          color: "black", // Label color
                        },
                      }}
                    >
                      {[{ token: "USDT (Polygon Network)" }]?.map((t) => (
                        <MenuItem
                          className="text-xs text-neutral-500"
                          key={t.token}
                          value={"USDT (Polygon Network)"}
                        >
                          <ListItemText className="text-xs" primary={t.token} />
                        </MenuItem>
                      ))}
                    </SelectField>

                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("wallet_id")}
                      error={touched.wallet_id && Boolean(errors.wallet_id)}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={
                          createForm
                            ? isCreateUserWalletLoading
                            : userWalletDetailsIsLoading
                        }
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}

        {type === "bankName" && (
          <Formik
            onSubmit={(val) => onSubmitBankName(val)}
            initialValues={{
              bank_name: existingValues[0] || "",
              bank_account_number: existingValues[1],
            }}
            validationSchema={validationSchemaBankName()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof BankNameTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues)
                    setFieldValue("bank_name", existingValues[0]);
                  if (existingValues[1])
                    setFieldValue("bank_account_number", existingValues[1]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <SelectField
                      variant="outlined"
                      label={currModalInfo.inputLabel}
                      defaultValue={existingValues[0]}
                      {...fieldProps("bank_name")}
                    >
                      {bankInfo?.map((bank: string, index) => (
                        <MenuItem
                          className="text-xs text-neutral-500"
                          key={index}
                          value={bank}
                        >
                          <ListItemText className="text-xs" primary={bank} />
                        </MenuItem>
                      ))}
                    </SelectField>

                    <TextFieldInput
                      type="text"
                      label={modalInfo["accountNumber"].inputLabel}
                      placeholder={modalInfo["accountNumber"].inputPlaceholder}
                      {...fieldProps("bank_account_number")}
                      error={
                        touched.bank_account_number &&
                        Boolean(errors.bank_account_number)
                      }
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={
                          createForm
                            ? tab
                              ? addUserBankDetailsIsLoading
                              : userBankDetailsIsLoading
                            : updateUserBankDetailsByIdIsLoading
                        }
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "name" && (
          <Formik
            onSubmit={(val) => onSubmitName(val)}
            initialValues={{
              name: "",
            }}
            validationSchema={validationSchemaName()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof NameTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues) setFieldValue("name", existingValues[0]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[0]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("name")}
                      error={touched.name && Boolean(errors.name)}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={userNameIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "phoneNumber" && (
          <Formik
            onSubmit={(val) => onSubmitPhoneNumber(val)}
            initialValues={{
              number: "",
            }}
            validationSchema={validationSchemaPhoneNumber()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof PhoneNumberTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues)
                    setFieldValue("number", existingValues[1]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[1]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                     type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("number")}
                      error={touched.number && Boolean(errors.number)}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={userPhoneNumberIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "email" && (
          <Formik
            onSubmit={(val) => onSubmitEmail(val)}
            initialValues={{
              email: "",
            }}
            validationSchema={validationSchemaEmail()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof EmailTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues) setFieldValue("email", existingValues[0]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[0]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("email")}
                      error={touched.email && Boolean(errors.email)}
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={userEmailIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "corporateName" && (
          <Formik
            onSubmit={(val) => onSubmitCorporateName(val)}
            initialValues={{
              corporate_name: "",
            }}
            validationSchema={validationSchemaCorporateName()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (field: keyof CorporateNameTypes) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues)
                    setFieldValue("corporate_name", existingValues[0]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[0]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("corporate_name")}
                      error={
                        touched.corporate_name && Boolean(errors.corporate_name)
                      }
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={corporateNameIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "corporateBankHolderName" && (
          <Formik
            onSubmit={(val) => onSubmitCorporateBankHolderName(val)}
            initialValues={{
              corporateBankHolderName: "",
            }}
            validationSchema={validationSchemaCorporateBankHolderName()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (
                field: keyof CorporateBankHolderNameTypes,
              ) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues)
                    setFieldValue("corporateBankHolderName", existingValues[0]);
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[0]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("corporateBankHolderName")}
                      error={
                        touched.corporateBankHolderName &&
                        Boolean(errors.corporateBankHolderName)
                      }
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={corporateBankAccHolderNameIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
        {type === "corporateRegistrationNumber" && (
          <Formik
            onSubmit={(val) => onSubmitCorporateRegistrationNumber(val)}
            initialValues={{
              corporateRegistrationNumber: "",
            }}
            validationSchema={validationSchemaCorporateRegistrationNumber()}
            validateOnBlur={false}
          >
            {({ getFieldProps, errors, touched, setFieldValue }) => {
              const fieldProps = (
                field: keyof CorporateRegistrationNumberTypes,
              ) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                React.useEffect(() => {
                  if (existingValues)
                    setFieldValue(
                      "corporateRegistrationNumber",
                      existingValues[1],
                    );
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [existingValues[1]]);

                const error = touched[field] && Boolean(errors[field]);
                const helperText = touched[field] && errors[field];

                return {
                  id: field,
                  error,
                  helperText,
                  ...getFieldProps(field),
                };
              };

              return (
                <Form>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}
                  >
                    <TextFieldInput
                      type="text"
                      label={currModalInfo.inputLabel}
                      placeholder={currModalInfo.inputPlaceholder}
                      {...fieldProps("corporateRegistrationNumber")}
                      error={
                        touched.corporateRegistrationNumber &&
                        Boolean(errors.corporateRegistrationNumber)
                      }
                    />

                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={corporateRegistrationNumberIsLoading}
                        handleClose={onClose}
                        submitText={text("add_platform_submit_btn_text")}
                        cancelText={text("add_platform_cancel_btn_text")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
      </Box>
    </CustomDialog>
  );
};

export default UDUpdateUserModal;

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
