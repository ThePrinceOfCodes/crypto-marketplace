import { formatNumberWithCommas } from "@common/utils/formatters";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
} from "@mui/material";
import clsx from "clsx";
import React, {
  Ref,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useRouter } from "next/router";
import { WithdrawModalProps, WithdrawalModalRef } from "./types";
import { Spinner } from "../Spinner";
import { useDialog } from "@common/context";
import {
  useGetSuperSaveWithdrawForm,
  useGetSuperUserDetail,
  useSetSuperSaveWithdrawForm,
  useSetWithdrawUserAsAdmin,
} from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { DataRow } from "../DataRow";
import { htmlIds } from "@cypress/utils/ids";
import { toast } from "react-toastify";
import { ErrorMessage, Field, Form, Formik } from "formik";
import FormFooter from "../FormFooter";
import * as Yup from "yup";
import TextFieldInput from "../FormInputs/TextField";
import CustomDialog from "../CustomDialog";

function WithdrawalModal(
  { email: _email, onSave }: WithdrawModalProps,
  ref: Ref<WithdrawalModalRef>,
) {
  const { text } = useLocale();
  const router = useRouter();
  const email = (router.query.email || _email) as string;
  const { data, isFetching, isRefetching, refetch } =
    useGetSuperSaveWithdrawForm(
      {
        email,
      },
      {
        enabled: !!email,
      },
    );

  const withdrawFormDetail = data?.data;

  const [reason, setReason] = useState<string | undefined>();
  const { data: user_details } = useGetSuperUserDetail({ email });
  const { mutateAsync: updateWithdrawalStatus, isLoading } =
    useSetSuperSaveWithdrawForm();
  const {
    mutateAsync: setWithdrawalUserAsAdmin,
    isLoading: withdrawalUserAsAdminLoading,
  } = useSetWithdrawUserAsAdmin();

  const [open, setOpen] = useState(false);
  const { confirmDialog, alertDialog } = useDialog();

  const validationSchema = Yup.object().shape({
    reason: Yup.string()
      .oneOf([
        "Not using the app",
        "Inconvenient to use due to errors",
        "Difficult to use",
        "Direct input",
      ])
      .required(text("user_withdrawal_reason_error")),
    reasonText: Yup.string()
      .trim()
      .when("reason", {
        is: "Direct input",
        then: (schema) =>
          schema.required(text("form_direct_input_placeholder")),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
  });

  const reasons = [
    {
      value: "Not using the app",
      label: "user_withdrawal_reason_1",
    },
    {
      value: "Inconvenient to use due to errors",
      label: "user_withdrawal_reason_2",
    },
    {
      value: "Difficult to use",
      label: "user_withdrawal_reason_3",
    },
    {
      value: "Direct input",
      label: "user_withdrawal_direct_input",
    },
  ];

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const onClose = () => {
    if (isRefetching || isLoading || withdrawalUserAsAdminLoading) {
      return;
    }
    setOpen(false);
  };

  const handleWithdrawUserAsAdmin = () => {
    if (reason) {
      if (user_details?.member_status !== 0) {
        if (data) {
          updateWithdrawalStatus({
            withdraw_request_id: data?.data?.withdraw_request_id,
          })
            .then((res) => {
              alertDialog({
                title:
                  res?.data?.message || text("user_withdrawal_saved_error"),
                onOk: async () => {
                  router.push("/users");
                  setOpen(false);
                },
              });
            })
            .catch((err) => {
              toast.error(err?.response?.data?.message || err?.response?.data?.error);
              setOpen(false);
            })
            .finally(() => {
              onSave && onSave();
            });
        }
      } else {
        setWithdrawalUserAsAdmin({
          reason: reason,
          description: withdrawFormDetail?.description || "",
          amount: withdrawFormDetail?.amount || 0,
          bank_name: withdrawFormDetail?.bank_name || "",
          bank_account_number: withdrawFormDetail?.bank_account_number || "",
          email: withdrawFormDetail?.email || "",
          wallet_type: withdrawFormDetail?.wallet_type || "",
          wallet_id: withdrawFormDetail?.wallet_id || "",
          amount_usdt: withdrawFormDetail?.amount_usdt || 0,
        })
          .then(() => {
            refetch().then((res) => {
              if (res.data) {
                updateWithdrawalStatus({
                  withdraw_request_id: res.data.data.withdraw_request_id,
                })
                  .then((res) => {
                    alertDialog({
                      title:
                        res?.data?.message ||
                        text("user_withdrawal_saved_error"),
                      onOk: async () => {
                        router.push("/users");
                        setOpen(false);
                      },
                    });
                  })
                  .catch((err) => {
                    toast.error(err?.response?.data?.message || err?.response?.data?.error);
                    setOpen(false);
                  })
                  .finally(() => {
                    // queryClient.invalidateQueries(["super-user-details", email]);
                    onSave && onSave();
                  });
              }
            });
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.error);
            setOpen(false);
          });
      }
    }
  };

  const onWithdrawal = (values: { reason: string; reasonText: string }) => {
    const reasonToSubmit =
      values.reason === "Direct input" ? values.reasonText : values.reason;
    setReason(reasonToSubmit);
    // if withdrawal completed
    if (user_details?.member_status === 2) {
      setOpen(false);
    }
    else {
      confirmDialog({
        title: withdrawFormDetail?.name || "",
        content: text("user_withdrawal_confirmation"),
        onOk: async () => handleWithdrawUserAsAdmin(),
      });
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("user_withdrawal_title")}
      maxWidth="md"
      fullWidth={false}
    >
      {isFetching || isRefetching ? (
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}>
          <Spinner size={8} />
        </Box>
      ) : (
        <>
          <Formik
            onSubmit={onWithdrawal}
            id={htmlIds.btn_withdrawal_modal_confirm}
            initialValues={{ reason: "", reasonText: "" }}
            validationSchema={validationSchema}
          >
            {({ values, setFieldValue }) => {
              return (
                <Form id={htmlIds.btn_withdrawal_modal_confirm}>
                  <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                    <div className="border border-1 mb-3 overflow-x-auto">
                      <DataRow
                        label={text("user_withdrawal_user_name")}
                        value={<p>{withdrawFormDetail?.name}</p>}
                      />
                      <DataRow
                        label={text("user_withdrawal_user_id")}
                        value={<p>{withdrawFormDetail?.user_id}</p>}
                      />
                      <DataRow
                        label={text("user_withdrawal_email")}
                        value={<p>{withdrawFormDetail?.email}</p>}
                      />
                      <DataRow
                        labelConClassName={clsx(
                          withdrawFormDetail?.amount
                            ? "text-red-500 font-semibold"
                            : "",
                        )}
                        label={
                          text("user_withdrawal_cumulative_accounts_payable") +
                          " (KRW)"
                        }
                        value={
                          <p>
                            {formatNumberWithCommas(withdrawFormDetail?.amount)}{" "}
                            {text("deposit_information_krw_suffix")}
                          </p>
                        }
                      />
                      <DataRow
                        label={text("user_withdrawal_deposit_amount")}
                        value={
                          <p>
                            {withdrawFormDetail?.bank_name}{" "}
                            {withdrawFormDetail?.bank_account_number}
                          </p>
                        }
                      />
                      <DataRow
                        labelConClassName={clsx(
                          withdrawFormDetail?.amount_usdt
                            ? "text-red-500 font-semibold"
                            : "",
                        )}
                        label={
                          text("user_withdrawal_cumulative_accounts_payable") +
                          " (USDT)"
                        }
                        value={
                          formatNumberWithCommas(
                            withdrawFormDetail?.amount_usdt,
                          ) + " USDT"
                        }
                      />
                      <DataRow
                        label={text("user_withdrawal_deposit_wallet_id")}
                        value={withdrawFormDetail?.wallet_id}
                      />
                      <DataRow
                        labelConClassName="h-[250px] text-red-500 font-semibold"
                        label={text("user_withdrawal_reasons")}
                        value={
                          <>
                            <div className="flex flex-col justify-start">
                              <FormControl>
                                <Field
                                  as={RadioGroup}
                                  name="reason"
                                  value={values.reason}
                                  onChange={(event: {
                                    currentTarget: {
                                      value: React.SetStateAction<
                                        string | undefined
                                      >;
                                    };
                                  }) => {
                                    setFieldValue(
                                      "reason",
                                      event.currentTarget.value,
                                    );
                                    setReason(event.currentTarget.value);
                                    setFieldValue("reasonText", "");
                                  }}
                                >
                                  {reasons.map(({ value, label }) => (
                                    <FormControlLabel
                                      key={value}
                                      value={value}
                                      control={<Radio />}
                                      label={text(label as LocalKeys)}
                                    />
                                  ))}

                                </Field>
                              </FormControl>

                              <FormGroup>
                                <Field
                                  name="reasonText"
                                  as={TextFieldInput}
                                  multiline
                                  label={text("user_withdrawal_direct_input")}
                                  rows={4}
                                  className=" w-full my-3 border-slate-400"
                                  placeholder={text(
                                    "user_withdrawal_direct_input_placeholder",
                                  )}
                                  disabled={values.reason !== "Direct input"}
                                  onChange={(event: {
                                    currentTarget: {
                                      value: React.SetStateAction<
                                        string | undefined
                                      >;
                                    };
                                  }) => {
                                    setFieldValue(
                                      "reasonText",
                                      event.currentTarget.value,
                                    );
                                    setReason(event.currentTarget.value);
                                  }}
                                />
                                <div className="text-red-500">
                                  <ErrorMessage name="reasonText" />
                                </div>
                              </FormGroup>

                              <div className="text-red-500">
                                <ErrorMessage name="reason" />
                              </div>
                            </div>
                          </>
                        }
                      />
                    </div>
                    <Box sx={{ display: "flex", columnGap: 2 }}>
                      <FormFooter
                        loading={isLoading}
                        handleClose={onClose}
                        submitText={text(
                          user_details?.member_status === 2
                            ? "user_withdrawal_check_btn"
                            : "user_withdrawal_btn",
                        )}
                        cancelText={text("common_cancel_button")}
                      />
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </>
      )}
    </CustomDialog>
  );
}

export default forwardRef(WithdrawalModal);

