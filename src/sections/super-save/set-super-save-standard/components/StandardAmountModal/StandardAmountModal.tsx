import { formatNumberWithCommas } from "@common/utils/formatters";
import { Box } from "@mui/material";
import React from "react";
import { toast } from "react-toastify";
import { useDialog } from "@common/context";
import {
  iPostSetSuperSaveAmountRsq,
  useGetSuperSaveAmount,
  useSetSuperSaveAmount,
} from "api/hooks";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import CustomDialog from "@common/components/CustomDialog";
import { Formik, Form } from "formik";
import TextFieldInput from "@common/components/FormInputs/TextField";
import * as Yup from "yup";
import FormFooter from "@common/components/FormFooter";

interface Values {
  amount?: number | null | undefined;
  sut_amount?: number | null | undefined;
  msqx_amount?: number | null | undefined;
  st_amount?: number | null | undefined;
  st_msqx_amount?: number | null | undefined;
  st_sut_amount?: number | null | undefined;
  st_p2u_amount?: number | null | undefined;
  msq_sale_price?: number | null | undefined;
  msqx_sale_price?: number | null | undefined;
  sut_sale_price?: number | null | undefined;
}

const StandardAmountModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose, handleSubmit }) => {
  const { text } = useLocale();
  const { alertDialog } = useDialog();
  const { data, refetch: refetchSuperSaveAmount } = useGetSuperSaveAmount();
  const { mutateAsync: setSuperSaveAmount, isLoading } =
    useSetSuperSaveAmount();

  const createValidationTest = (fields: (keyof Values)[]) => {
    return function (
      this: Yup.TestContext<Values>,
      value: number | null | undefined,
    ) {
      return (
        fields.some((field) => this.parent[field] !== null) || value !== null
      );
    };
  };

  const validationSchema = Yup.object<Values>().shape({
    amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    sut_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    msqx_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    st_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    st_msqx_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    st_sut_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    st_p2u_amount: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "msq_sale_price",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    msq_sale_price: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msqx_sale_price",
          "sut_sale_price",
        ]),
      ),
    msqx_sale_price: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "sut_sale_price",
        ]),
      ),
    sut_sale_price: Yup.number()
      .nullable()
      .min(0, text("set_standard_amount_modal_validation_number"))
      .test(
        "one-required",
        text("set_standard_amount_modal_amount_validation"),
        createValidationTest([
          "amount",
          "sut_amount",
          "msqx_amount",
          "st_amount",
          "st_msqx_amount",
          "st_sut_amount",
          "st_p2u_amount",
          "msq_sale_price",
          "msqx_sale_price",
        ]),
      ),
  });

  const onSubmitNewFunction = async (values: Values) => {
    if (!data) return;

    const superSaveAmount: iPostSetSuperSaveAmountRsq = {
      amount: data?.super_save_amount,
      msqx_amount: data?.msqx_super_save_amount,
      sut_amount: data?.sut_super_save_amount,
      super_trust_amount: data?.super_trust_amount,
      msqx_super_trust_amount: data?.msqx_super_trust_amount,
      sut_super_trust_amount: data?.sut_super_trust_amount,
      p2u_super_trust_amount: data?.p2u_super_trust_amount,
      super_trust_ratio: data?.super_trust_ratio,
      msqx_super_trust_ratio: data?.msqx_super_trust_ratio,
      sut_super_trust_ratio: data?.sut_super_trust_ratio,
      discount: data?.super_save_discount,
      msqx_discount: data?.msqx_super_save_discount,
      sut_discount: data?.sut_super_save_discount,
      super_trust_discount: data?.super_trust_discount,
      msqx_super_trust_discount: data?.msqx_super_trust_discount,
      sut_super_trust_discount: data?.sut_super_trust_discount,
      credit_sale_amount: data?.credit_sale_amount,
      credit_sale_discount: data?.credit_sale_discount,
      msqx_credit_sale_amount: data?.msqx_credit_sale_amount,
      msqx_credit_sale_discount: data?.msqx_credit_sale_discount,
      sut_credit_sale_amount: data?.sut_credit_sale_amount,
      sut_credit_sale_discount: data?.sut_credit_sale_discount,
    };
    if (values.amount != null) superSaveAmount.amount = values.amount;

    if (values.msqx_amount != null)
      superSaveAmount.msqx_amount = values.msqx_amount;

    if (values.sut_amount != null)
      superSaveAmount.sut_amount = values.sut_amount;

    if (values.st_amount != null)
      superSaveAmount.super_trust_amount = values.st_amount;

    if (values.st_msqx_amount != null)
      superSaveAmount.msqx_super_trust_amount = values.st_msqx_amount;

    if (values.st_sut_amount != null)
      superSaveAmount.sut_super_trust_amount = values.st_sut_amount;

    if (values.st_p2u_amount != null)
      superSaveAmount.p2u_super_trust_amount = values.st_p2u_amount;

    if (values.msq_sale_price != null)
      superSaveAmount.credit_sale_amount = values.msq_sale_price;

    if (values.msqx_sale_price != null)
      superSaveAmount.msqx_credit_sale_amount = values.msqx_sale_price;

    if (values.sut_sale_price != null)
      superSaveAmount.sut_credit_sale_amount = values.sut_sale_price;


    setSuperSaveAmount({ ...superSaveAmount })
      .then((res) => {
        refetchSuperSaveAmount();
        toast(res.data.result, {
          type: "success",
        });
        alertDialog({
          title: text("set_standard_amount_modal_saved"),
          onOk: async () => {
            handleSubmit();
            handleClose();
          },
        });
      })
      .catch((err) => {
        toast(err?.response?.data.error, {
          type: "error",
        });
      });
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any,
  ) => {
    const { name, value } = event.target;
    setFieldValue(name, value === "" ? null : Number(value));
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      titleText={text("set_standard_amount_modal_title")}
    >
      <div className="flex flex-col space-y-5 py-4 rounded-md bg-slate-100 px-4 my-4">
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_msq_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.super_save_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msq")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_st_msq_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.super_trust_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msq")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_msqx_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.msqx_super_save_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msqx")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_st_msqx_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.msqx_super_trust_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msqx")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_sut_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.sut_super_save_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_sut")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_st_sut_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.sut_super_trust_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_sut")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_st_p2u_amount_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.p2u_super_trust_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msqx")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_msq_credit_sale_price_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.credit_sale_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msqx")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_msqx_credit_sale_price_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.msqx_credit_sale_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_msqx")}
          </span>
        </div>
        <div className={"flex flex-row justify-between"}>
          <span className="text-xs">
            {" "}
            {text("set_standard_sut_credit_sale_price_modal_detail")}{" "}
          </span>
          <span className="text-sm font-bold">
            {data
              ? formatNumberWithCommas(data?.sut_credit_sale_amount) +
                text("set_standard_amount_modal_krw")
              : text("set_standard_amount_modal_request_sut")}
          </span>
        </div>
      </div>
      <Formik
        onSubmit={onSubmitNewFunction}
        initialValues={{
          amount: null,
          msqx_amount: null,
          sut_amount: null,
          st_amount: null,
          st_msqx_amount: null,
          st_sut_amount: null,
          st_p2u_amount: null,
          msq_sale_price: null,
          msqx_sale_price: null,
          sut_sale_price: null,
        }}
        validationSchema={validationSchema}
      >
        {({ touched, errors, getFieldProps, setFieldValue }) => {
          return (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2 }}>
                <TextFieldInput
                  id={htmlIds.input_set_standard_amount_enter_amount}
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={touched.amount && errors.amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_msq_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_msq_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />

                <TextFieldInput
                  error={touched.msqx_amount && Boolean(errors.msqx_amount)}
                  helperText={touched.msqx_amount && errors.msqx_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_msqx_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_msqx_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("msqx_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />

                <TextFieldInput
                  error={touched.sut_amount && Boolean(errors.sut_amount)}
                  helperText={touched.sut_amount && errors.sut_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_sut_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_sut_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("sut_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={touched.st_amount && Boolean(errors.st_amount)}
                  helperText={touched.st_amount && errors.st_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_st_msq_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_st_msq_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("st_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={
                    touched.st_msqx_amount && Boolean(errors.st_msqx_amount)
                  }
                  helperText={touched.st_msqx_amount && errors.st_msqx_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_st_msqx_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_st_msqx_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("st_msqx_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={touched.st_sut_amount && Boolean(errors.st_sut_amount)}
                  helperText={touched.st_sut_amount && errors.st_sut_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_st_sut_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_st_sut_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("st_sut_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={touched.st_p2u_amount && Boolean(errors.st_p2u_amount)}
                  helperText={touched.st_p2u_amount && errors.st_p2u_amount}
                  placeholder={text(
                    "set_standard_amount_modal_enter_st_p2u_amount_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_st_p2u_amount_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("st_p2u_amount")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={
                    touched.msq_sale_price && Boolean(errors.msq_sale_price)
                  }
                  helperText={touched.msq_sale_price && errors.msq_sale_price}
                  placeholder={text(
                    "set_standard_amount_modal_enter_msq_credit_sale_price_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_msq_credit_sale_price_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("msq_sale_price")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={
                    touched.msqx_sale_price && Boolean(errors.msqx_sale_price)
                  }
                  helperText={touched.msqx_sale_price && errors.msqx_sale_price}
                  placeholder={text(
                    "set_standard_amount_modal_enter_msqx_credit_sale_price_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_msqx_credit_sale_price_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("msqx_sale_price")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
                />
                <TextFieldInput
                  error={
                    touched.sut_sale_price && Boolean(errors.sut_sale_price)
                  }
                  helperText={touched.sut_sale_price && errors.sut_sale_price}
                  placeholder={text(
                    "set_standard_amount_modal_enter_sut_credit_sale_price_placeholder",
                  )}
                  label={text(
                    "set_standard_amount_modal_enter_sut_credit_sale_price_placeholder",
                  )}
                  type="number"
                  {...getFieldProps("sut_sale_price")}
                  onChange={(e: any) => handleFieldChange(e, setFieldValue)}
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

export default StandardAmountModal;
