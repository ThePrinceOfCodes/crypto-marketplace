import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { useRouter } from "next/router";
import { useDialog } from "@common/context";
import { LocalKeys, useLocale } from "locale";
import ContainedMuiButton from "../MuiButton";
import { RejectSuperUserRequestModalData, RejectSuperUserRequestModalRef } from "./types";
import { useGetSuperUserDetail, useRejectSuperUserRequest } from "api/hooks";
import { DataRow } from "../DataRow";
import CustomDialog from "../CustomDialog";
import TextFieldInput from "../FormInputs/TextField";
import { Spinner } from "../Spinner";

const reasons = [
  {
    value: "ID cannot be identified and missing",
    title: "super_save_registration_reason_1",
  },
  {
    value: "ID card contents are different from member information",
    title: "super_save_registration_reason_2",
  },
  {
    value: "ID and face photo do not match",
    title: "super_save_registration_reason_3",
  },
  {
    value: "Direct input",
    title: "user_withdrawal_direct_input",
  },
];

function RejectSuperUserRequestModal(
  {
    email: _email,
    usdt_modal = false,
    superSaveAction = false
  }: { email?: string; usdt_modal?: boolean; superSaveAction?: boolean },
  ref: Ref<RejectSuperUserRequestModalRef>,
) {
  const { text } = useLocale();
  const email = (useRouter().query.email || _email) as string;
  const { data: user_details, refetch: refetchUserDetails, isFetching, isRefetching } =
    useGetSuperUserDetail({ email });

  const { mutateAsync: rejectUser } = useRejectSuperUserRequest();

  const [open, setOpen] = useState(false);
  const { confirmDialog, alertDialog } = useDialog();

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
    }),
    [],
  );

  const onClose = () => {
    setOpen(false);
  };

  const onReject = (values: { reason: string; reasonText: string }) => {
    if (values && values.reason !== "" && values.reason?.trim()?.length > 0) {
      confirmDialog({
        title: user_details?.msq_name || "",
        content: text("super_save_registration_reason_confirmation"),
        onOk: () => {
          return rejectUser(
            {
              remark: values.reason === "Direct input" ? values.reasonText : values.reason,
              request_id: usdt_modal && !superSaveAction
                ? user_details?.usdt_uuid as string
                : superSaveAction ? user_details?.uuid as string : "",
              usdtAction: usdt_modal && !superSaveAction ? true : false,
            },
            {
              onSuccess: () =>
                alertDialog({
                  title: text("super_save_registration_saved_title"),
                  onOk: async () => {
                    refetchUserDetails();
                    onClose();
                  },
                }),
            },
          );
        },
      });
    } else {
      alertDialog({
        title: text("super_save_registration_reason_warning"),
      });
    }
  };

  const getTitle = () => {
    return usdt_modal
      ? text("super_save_usdt_registration_title")
      : text("super_save_registration_title");
  };

  const validationSchema = Yup.object().shape({
    reasonText: Yup.mixed().when("reason", (reason, schema) => {
      return reason && reason.includes("Direct input")
        ? schema.required(text("super_save_registration_reason_error"))
        : schema.nullable().notRequired();
    }),
  });

  const clearErrorOnTouch = (setFieldTouched: (field: string, touched: boolean, shouldValidate?: boolean) => void, setFieldError: (field: string, message: string | undefined) => void,
    field: string, otherFields: (keyof RejectSuperUserRequestModalData)[] = ["reason", "reasonText"]) => {
    setFieldTouched(field, true, false);
    setFieldError(field, "");
    otherFields.forEach((otherField) => {
      if (otherField !== field) {
        setFieldTouched(otherField, false);
        setFieldError(otherField, "");
      }
    });
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={getTitle()}
      maxWidth={"md"}
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
        <Formik
          initialValues={{ reason: "", reasonText: "" }}
          validationSchema={validationSchema}
          onSubmit={onReject}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ values, errors, touched, setFieldValue, getFieldProps, setFieldTouched, setFieldError }) => {

            function fieldProps(field: keyof RejectSuperUserRequestModalData) {
              const error = touched[field] && Boolean(errors[field]);
              const helperText = touched[field] && errors[field];

              return {
                error, helperText, ...getFieldProps(field), onBlur: () => {
                  setFieldTouched(field);
                },
                onFocus: () => {
                  clearErrorOnTouch(setFieldTouched, setFieldError, field);
                  field === "reason" && setFieldValue("reasonText", "");
                },
              };
            }

            return (
              <Form >
                <Box sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}>
                  <div className="border border-1">
                    <DataRow
                      label={text("super_save_registration_user_name_title")}
                      value={<p>{user_details?.msq_name}</p>}
                    />
                    <DataRow
                      label={text("super_save_registration_user_id")}
                      value={<p>{user_details?.id}</p>}
                    />
                    <DataRow
                      label={text("super_save_registration_email")}
                      value={<p>{user_details?.email}</p>}
                    />
                    <DataRow
                      labelConClassName={`text-red-600 font-semibold ${(superSaveAction || !user_details?.remark) && "h-[250px]"
                        }`}
                      label={text("super_save_registration_reason_for_refusal")}
                      value={
                        (!usdt_modal && !superSaveAction && user_details?.remark) || (user_details?.usdt_remark && usdt_modal) ? (
                          <p>
                            {usdt_modal ? user_details?.usdt_remark : user_details.remark}
                          </p>
                        ) : (
                          <div>
                            <FormControl>
                              <Field
                                as={RadioGroup}
                                {...fieldProps("reason")}
                              >
                                {reasons.map(({ value, title }) => (
                                  <FormControlLabel
                                    key={title}
                                    value={value}
                                    control={<Radio />}
                                    label={text(title as LocalKeys)}
                                  />
                                ))}

                              </Field>
                            </FormControl>

                            <FormGroup>
                              <Field
                                as={TextFieldInput}
                                multiline
                                label={text("super_save_registration_direct_input")}
                                rows={4}
                                className=" w-full mt-3 mb-2 border-slate-400"
                                placeholder={text(
                                  "super_save_registration_reason_placeholder",
                                )}
                                disabled={values.reason !== "Direct input"}
                                {...fieldProps("reasonText")}
                              />
                            </FormGroup>
                          </div>
                        )
                      }
                    />
                  </div>
                  <Box sx={{ display: "flex", columnGap: 2, justifyContent: "center" }}>
                    <Button
                      onClick={onClose}
                      variant="outlined"
                      type="reset"
                      size="large"
                      sx={{ width: "140px" }}
                    >
                      {text("super_save_registration_cancel_btn")}
                    </Button>
                    {!(
                      (!usdt_modal && !superSaveAction && user_details?.remark) ||
                      (usdt_modal && user_details?.usdt_remark)
                    ) && (
                        <ContainedMuiButton
                          type="submit"
                          sx={{ width: "140px" }}
                        >
                          {text("super_save_registration_reject_btn")}
                        </ContainedMuiButton>
                      )}
                  </Box>
                </Box>
              </Form>);
          }}
        </Formik>)}
    </CustomDialog >
  );
}

export default forwardRef(RejectSuperUserRequestModal);
