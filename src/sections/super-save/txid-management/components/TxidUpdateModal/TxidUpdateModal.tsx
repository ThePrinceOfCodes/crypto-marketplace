import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { LocalKeys, useLocale } from "locale";
import { FieldValues } from "react-hook-form";
import { ITxidUpdateModalProps, ITxidUpdateSubmitData } from "./types";
import { Formik, Form } from "formik";
import { requiredStringValidator } from "@common/utils/validationSchemas";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import * as Yup from "yup";

function TxidUpdateModal({
  open,
  onCancel,
  onOk,
  isSubmitting,
  initialValues,
}: ITxidUpdateModalProps) {
  const { text } = useLocale();

  const [validationMessage, setValidationMessage] = useState("");

  const handleOnSubmit = (data: FieldValues) => {
    if (validationMessage) {
      return;
    }

    onOk(data as ITxidUpdateSubmitData);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      titleText={text("update_txid_modal_title")}
    >
      <Box>
        <Formik
          initialValues={initialValues}
          onSubmit={(val) => handleOnSubmit(val)}
          validationSchema={Yup.object().shape({
            ...requiredStringValidator(
              ["refund_txid", "refund_reason"],
              text("form_error_required"),
            ),
            refund_amount: Yup.number().min(1, text("txid_management_return_coin_amount_error"))
          }
          )}
        >
          {({ values, touched, errors, getFieldProps }) => {
            //eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              const value = values.refund_txid;

              const txRegex = /0x([A-Za-z0-9]{64})/;

              const matchResult = RegExp(txRegex).exec(value);

              const extractedTxid = matchResult ? matchResult[0] : null;

              if (extractedTxid) {
                setValidationMessage("");
              } else if (value == "") {
                setValidationMessage("");
              } else {
                setValidationMessage("Invalid Format");
              }
            }, [values]);

            function getFieldLabel(textLabel: string) {
              const fs = text(textLabel as LocalKeys);
              const ls = text("field_optional_tag");

              return `${fs} (${ls})`;
            }

            return (
              <Form>
                <Box
                  sx={{ display: "flex", flexDirection: "column", rowGap: 3 }}
                >
                  <Box>
                    <TextFieldInput
                      label={text("update_txid_modal_input_return_txid_title")}
                      placeholder={text(
                        "update_txid_modal_input_return_txid_placeholder",
                      )}
                      error={
                        (touched.refund_txid && Boolean(errors.refund_txid)) ||
                        Boolean(validationMessage)
                      }
                      helperText={touched.refund_txid && errors.refund_txid}
                      {...getFieldProps("refund_txid")}
                    />
                    {validationMessage == "Invalid Format" && (
                      <div className="flex">
                        <span className="mt-2 rounded-full p-1 px-4 bg-orange-500 text-white">
                          <p className="text-xs"> {validationMessage} </p>
                        </span>
                      </div>
                    )}
                  </Box>
                  <TextFieldInput
                    label={getFieldLabel(
                      "update_txid_modal_input_return_amount_title",
                    )}
                    placeholder={text(
                      "update_txid_modal_input_return_amount_placeholder",
                    )}
                    error={
                      touched.refund_amount && Boolean(errors.refund_amount)
                    }
                    helperText={touched.refund_amount && errors.refund_amount}
                    type="number"
                    {...getFieldProps("refund_amount")}
                  />
                  <TextFieldInput
                    label={getFieldLabel(
                      "update_txid_modal_input_return_coin_title",
                    )}
                    placeholder={text(
                      "update_txid_modal_input_return_coin_placeholder",
                    )}
                    {...getFieldProps("refund_token")}
                  />

                  <TextFieldInput
                    label={text("update_txid_modal_input_return_reason_title")}
                    placeholder={text(
                      "update_txid_modal_input_return_reason_placeholder",
                    )}
                    error={
                      touched.refund_reason && Boolean(errors.refund_reason)
                    }
                    helperText={touched.refund_reason && errors.refund_reason}
                    {...getFieldProps("refund_reason")}
                  />

                  <Box sx={{ display: "flex", columnGap: 2 }}>
                    <FormFooter
                      cancelText={text("add_news_cancel_btn_text")}
                      submitText={text("add_news_submit_btn_text")}
                      handleClose={onCancel}
                      loading={isSubmitting}
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

export default TxidUpdateModal;
