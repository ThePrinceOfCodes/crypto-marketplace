import { Box } from "@mui/material";
import React from "react";
import { useDialog } from "@common/context";
import { useGetSuperSaveBankFee, useSetSuperSaveBankFee } from "api/hooks";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useLocale } from "locale";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import CustomDialog from "@common/components/CustomDialog";
import { queryClient } from "api";

interface Values {
  bank_fee: number | null;
  usdt_charge: number | null;
}

const BankFeeModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose, handleSubmit }) => {
  const { text } = useLocale();
  const { confirmDialog, alertDialog } = useDialog();

  const validationSchema = Yup.object().shape({
    bank_fee: Yup.number()
      .nullable()
      .test(
        "one-required",
        text("set_bank_fee_modal_required_one_field_error"),
        function (value) {
          const { usdt_charge } = this.parent;
          return (value !== null && value !== undefined) || (usdt_charge !== null && usdt_charge !== undefined);
        },
      )
      .min(0, text("set_bank_fee_modal_min_value_error")),
    usdt_charge: Yup.number()
      .nullable()
      .test(
        "one-required",
        text("set_bank_fee_modal_required_one_field_error"),
        function (value) {
          const { bank_fee } = this.parent;
          return (value !== null && value !== undefined) || (bank_fee !== null && bank_fee !== undefined);
        },
      )
      .min(0, text("set_bank_fee_modal_min_value_error")),
  });

  const { data } = useGetSuperSaveBankFee();
  const { mutateAsync: setSuperSaveBankFee, isLoading } =
    useSetSuperSaveBankFee();

  const handleSave = (values: Values) => {
    confirmDialog({
      title: text("set_bank_fee_modal_save_title"),
      content: text("set_bank_fee_modal_save_content"),
      cancelButtonText: text("set_bank_fee_modal_save_canel_btn"),
      okButtonText: text("set_bank_fee_modal_save"),
      onOk: () => onSubmit(values),
    });
  };

  const onSubmit = async (values: Values) => {
    const newData = {
      fee:
        values.bank_fee !== null && values.bank_fee !== undefined
          ? values.bank_fee
          : data && data.bank_fee
            ? data.bank_fee
            : 0,
      usdt:
        values.usdt_charge !== null && values.usdt_charge !== undefined
          ? values.usdt_charge
          : data && data.usdt_charge
            ? data.usdt_charge
            : 0,
    };

    setSuperSaveBankFee({
      ...newData,
    })
      .then((res) => {
        toast(res.data.result, {
          type: "success",
        });
        alertDialog({
          title: text("set_bank_fee_modal_saved"),
          onOk: async () => {
            handleClose();
            handleSubmit();
            queryClient.invalidateQueries("get-super-save-bank-fee");
          },
        });
      })
      .catch((err) => {
        toast(err?.response?.data.error || err?.response?.data.message, {
          type: "error",
        });
      });
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={text("set_bank_fee_modal_title")}
    >
      <div className={"bg-slate-100 px-4 my-4 py-10 flex flex-col space-y-5"}>
        <div className="flex flex-row justify-between">
          <span className="text-xs">
            {text("set_bank_fee_modal_current_fee")}
          </span>
          <span className="text-sm font-bold">
            {data
              ? data?.bank_fee?.toLocaleString() +
                text("set_bank_fee_modal_krw")
              : text("set_bank_fee_modal_warning")}
          </span>
        </div>
        <div className="flex flex-row justify-between ">
          <span className="text-xs">
            {text("set_bank_fee_modal_current_usdt_charge")}
          </span>
          <span className="text-sm font-bold">
            {data
              ? data?.usdt_charge?.toLocaleString() + " USDT"
              : text("set_usdt_charge_modal_warning")}
          </span>
        </div>
      </div>

      <Formik
        onSubmit={handleSave}
        initialValues={{ bank_fee: null, usdt_charge: null }}
        validationSchema={validationSchema}
      >
        {({ touched, errors, getFieldProps }) => {
          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
                <TextFieldInput
                  error={touched.bank_fee && Boolean(errors.bank_fee)}
                  helperText={touched.bank_fee && errors.bank_fee}
                  placeholder={text("set_bank_fee_modal_enter_fee")}
                  label={text("set_bank_fee_label")}
                  type="number"
                  {...getFieldProps("bank_fee")}
                />

                <TextFieldInput
                  error={touched.usdt_charge && Boolean(errors.usdt_charge)}
                  helperText={touched.usdt_charge && errors.usdt_charge}
                  placeholder={text("set_bank_fee_modal_enter_usdt")}
                  label={text("set_usdt_charge_label")}
                  type="number"
                  {...getFieldProps("usdt_charge")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    loading={isLoading}
                    handleClose={handleClose}
                    submitText={text("set_bank_fee_modal_save")}
                    cancelText={text("set_bank_fee_modal_cancel")}
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

export default BankFeeModal;
