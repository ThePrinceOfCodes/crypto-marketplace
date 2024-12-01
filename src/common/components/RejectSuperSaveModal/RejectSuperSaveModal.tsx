import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, {
  Ref,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { RejectSuperSaveModalProps, RejectSuperSaveModalRef } from "./types";
import {
  usePostUpdateUserSuperSaveStatus,
} from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { DataRow } from "../DataRow";
import { htmlIds } from "@cypress/utils/ids";
import { toast } from "react-toastify";
import { ErrorMessage, Field, Form, Formik } from "formik";
import FormFooter from "../FormFooter";
import * as Yup from "yup";
import TextFieldInput from "../FormInputs/TextField";


const reasons = [
    {
      value: "Education not be attended",
      label: "user_restriction_reason",
    },
    {
      value: "Direct input",
      label: "user_withdrawal_direct_input",
    },
  ];

function RejectSuperSaveModal(
  { rejectSuperSaveData, onSave }: RejectSuperSaveModalProps,
  ref: Ref<RejectSuperSaveModalRef>,
) {
  const { text } = useLocale();
  const { mutateAsync: updateUserSuperSaveStatus, isLoading } =
    usePostUpdateUserSuperSaveStatus();
  const [open, setOpen] = useState(false);
  const validationSchema = Yup.object().shape({
    reason: Yup.string()
      .oneOf([
        "Education not be attended",
        "Direct input",
      ])
      .required(text("user_withdrawal_reason_error")),
    reasonText: Yup.string()
    .trim()
    .when("reason", {
      is: "Direct input",
      then: (schema) =>
        schema.required(text("user_super_save_direct_input_placeholder")),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  });


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

  const  onUpdateStatus  = async (values: { reason: string; reasonText: string }) => {
    const reasonToSubmit =
      values.reason === "Direct input" ? values.reasonText : values.reason;
    const updateStatusData = {
    user_id: rejectSuperSaveData?.user_id,
    reason: reasonToSubmit
    };

    try {
      await updateUserSuperSaveStatus(updateStatusData, {
        onSuccess: () => {
          toast.success(text("user_super_save_status_update"), {
            autoClose: 1500,
          });
        },
      });

      if(onSave){
        onSave();
      };
      onClose();
    } catch (error: any) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.error(text("super_save_user_community_offline_error"), {
          autoClose: 1500,
        });
      } else {
        toast.error(
          error.response?.data?.result ||
          "There was an error, please try again",
        );
      }
    }
  };

  return (
    <Dialog
      id={htmlIds.div_withdrawal_modal_container}
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
        <>
          <DialogTitle className="flex justify-between items-center">
            <Typography>{text("user_super_save_restriction_title")}</Typography>
            <button
              aria-label="close icon"
              className="flex items-start text-slate-400 h-8 w-8"
              onClick={onClose}
            >
              <XMarkIcon className="h-8 w-8 p-1" />
            </button>
          </DialogTitle>
          <DialogContent>
            <Formik
              onSubmit={onUpdateStatus}
              id={htmlIds.btn_withdrawal_modal_confirm}
              initialValues={{ reason: "", reasonText: "" }}
              validationSchema={validationSchema}
            >
              {({ values, setFieldValue }) => {
                return (
                  <Form id={htmlIds.btn_withdrawal_modal_confirm}>
                    <div className="border border-1 mb-3">
                      <DataRow
                        label={text("user_super_save_user_name")}
                        value={<p>{rejectSuperSaveData?.user_name}</p>}
                      />
                      <DataRow
                        label={text("user_super_save_user_id")}
                        value={<p>{rejectSuperSaveData?.user_id}</p>}
                      />
                      <DataRow
                        label={text("user_super_save_email")}
                        value={<p>{rejectSuperSaveData?.user_email}</p>}
                      />
                      <DataRow
                        labelConClassName="h-[250px] text-red-500 font-semibold"
                        label={text("user_super_save_reasons")}
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
                                  label={text("user_super_save_direct_input")}
                                  rows={4}
                                  className=" w-full my-3 border-slate-400"
                                  placeholder={text(
                                    "user_super_save_direct_input_placeholder",
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
                        submitText={text("user_restriction_btn")}
                        cancelText={text("common_cancel_button")}
                      />
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
        </>
    </Dialog>
  );
}

export default forwardRef(RejectSuperSaveModal);

