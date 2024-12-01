import * as Yup from "yup";
import React, { useEffect } from "react";
import CustomDialog from "@common/components/CustomDialog";
import TextFieldInput from "@common/components/FormInputs/TextField";
import FormFooter from "@common/components/FormFooter";
import { Formik, Form } from "formik";
import { useGetReservedLimit, useUpdateReservedLimit } from "api/hooks";
import { toast } from "react-toastify";
import { useLocale } from "locale";
import { formatNumberWithCommas } from "@common/utils/formatters";
import { Box } from "@mui/material";
import { requiredStringValidator } from "@common/utils/validationSchemas";

const SetSuperSaveLimitModal: React.FC<{
  open: boolean;
  type: string;
  handleCloseSuperSaveLimitModal: () => void;
}> = ({ open, type, handleCloseSuperSaveLimitModal }) => {
  const { text } = useLocale();

  function validationSchema() {
    return Yup.object().shape(
      requiredStringValidator(["amount"], text("form_error_required")),
    );
  }

  const { data, refetch } = useGetReservedLimit({
    type: type,
  });

  useEffect(() => {
    refetch();
  }, [refetch, type]);

  const { mutateAsync: updateReserveLimit, isLoading } =
    useUpdateReservedLimit();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    updateReserveLimit({
      type: type,
      ...data,
    })
      .then((res) => {
        toast(res.data.result, {
          type: "success",
        });
        handleCloseSuperSaveLimitModal();
        refetch();
      })
      .catch((err) => {
        toast(err?.response?.data.error || err?.response?.data.result, {
          type: "error",
        });
      });
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleCloseSuperSaveLimitModal}
      titleText={
        type === "KRW"
          ? text("set_super_save_limit_modal_title_krw")
          : text("set_super_save_limit_modal_title_usdt")
      }
    >
      <Formik
        onSubmit={(val) => onSubmit(val)}
        initialValues={{ amount: "" }}
        validationSchema={validationSchema()}
      >
        {({ touched, errors, getFieldProps }) => {
          function getLabelNplaceholder() {
            return type === "KRW"
              ? text("set_super_save_limit_modal_enter_krw")
              : text("set_super_save_limit_modal_enter_usdt");
          }

          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 4 }}>
                <div
                  className={"bg-slate-100 px-4 py-5 flex flex-col space-y-5"}
                >
                  <div className="flex flex-row justify-between">
                    <span className="text-sm">
                      {text("set_set_super_save_limit_modal_current_fee")}
                    </span>
                    <span className="text-sm font-bold">{`${
                      data && formatNumberWithCommas(data?.value)
                    } ${
                      type === "KRW"
                        ? text("deposit_information_krw_suffix")
                        : "USDT"
                    }`}</span>
                  </div>
                </div>

                <TextFieldInput
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={touched.amount && errors.amount}
                  placeholder={getLabelNplaceholder()}
                  label={getLabelNplaceholder()}
                  type="number"     
                  {...getFieldProps("amount")}
                />

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <FormFooter
                    loading={isLoading}
                    handleClose={handleCloseSuperSaveLimitModal}
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

export default SetSuperSaveLimitModal;
