import { Box, Slider } from "@mui/material";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDialog } from "@common/context";
import {
  iPostSetSuperSaveAmountRsq,
  useGetSuperSaveAmount,
  useSetSuperSaveAmount,
} from "api/hooks";
import { useLocale } from "locale";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

const StandardDiscountAmountModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose: onCancel, handleSubmit }) => {
  const { text } = useLocale();
  const { alertDialog } = useDialog();
  const { data, refetch: refetchSuperSaveAmount } = useGetSuperSaveAmount();
  const { mutateAsync: setSuperSaveAmount, isLoading } =
    useSetSuperSaveAmount();

  const [msqDiscountPercentage, setMsqDiscountPercentage] = useState({
    msqDiscount: 0,
    sutDiscount: 0,
    stMsqDiscount: 0,
    msqxDiscount: 0,
    stMsqxDiscount: 0,
    stSutDiscount: 0,
    creditSaleDiscount: 0,
    msqxCreditSaleDiscount: 0,
    sutCreditSaleDiscount: 0,
  });

  useEffect(() => {
    setMsqDiscountPercentage({
      msqDiscount: data?.super_save_discount || 0,
      stMsqDiscount: data?.super_trust_discount || 0,
      msqxDiscount: data?.msqx_super_save_discount || 0,
      stMsqxDiscount: data?.msqx_super_trust_discount || 0,
      sutDiscount: data?.sut_super_save_discount || 0,
      stSutDiscount: data?.sut_super_trust_discount || 0,
      creditSaleDiscount: data?.credit_sale_discount || 0,
      msqxCreditSaleDiscount: data?.msqx_credit_sale_discount || 0,
      sutCreditSaleDiscount: data?.sut_credit_sale_discount || 0,
    });
  }, [data, setMsqDiscountPercentage, open]);

  const resetForm = () => {
    setMsqDiscountPercentage({
      msqDiscount: 0,
      sutDiscount: 0,
      stMsqDiscount: 0,
      msqxDiscount: 0,
      stMsqxDiscount: 0,
      stSutDiscount: 0,
      creditSaleDiscount: 0,
      msqxCreditSaleDiscount: 0,
      sutCreditSaleDiscount: 0,
    });
  };

  const handleClose = () => {
    onCancel();
    resetForm();
  };


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (event: any) => {
    event.preventDefault();
    if (!data) return;

    const superSaveAmount: iPostSetSuperSaveAmountRsq = {
      amount: data.super_save_amount,
      msqx_amount: data.msqx_super_save_amount,
      sut_amount: data.sut_super_save_amount,
      super_trust_amount: data.super_trust_amount,
      msqx_super_trust_amount: data.msqx_super_trust_amount,
      sut_super_trust_amount: data.sut_super_trust_amount,
      p2u_super_trust_amount: data.p2u_super_trust_amount,
      super_trust_ratio: data.super_trust_ratio,
      msqx_super_trust_ratio: data.msqx_super_trust_ratio,
      sut_super_trust_ratio: data.sut_super_trust_ratio,
      discount: data.super_save_discount,
      msqx_discount: data.msqx_super_save_discount,
      sut_discount: data.sut_super_save_discount,
      super_trust_discount: data.super_trust_discount,
      msqx_super_trust_discount: data.msqx_super_trust_discount,
      sut_super_trust_discount: data.sut_super_trust_discount,
      credit_sale_amount: data.credit_sale_amount,
      credit_sale_discount: data.credit_sale_discount,
      msqx_credit_sale_amount: data.msqx_credit_sale_amount,
      msqx_credit_sale_discount: data.msqx_credit_sale_discount,
      sut_credit_sale_amount: data.sut_credit_sale_amount,
      sut_credit_sale_discount: data.sut_credit_sale_discount,
    };

    superSaveAmount.discount = msqDiscountPercentage.msqDiscount;
    superSaveAmount.msqx_discount = msqDiscountPercentage.msqxDiscount;
    superSaveAmount.sut_discount = msqDiscountPercentage.sutDiscount;
    superSaveAmount.super_trust_discount = msqDiscountPercentage.stMsqDiscount;
    superSaveAmount.msqx_super_trust_discount = msqDiscountPercentage.stMsqxDiscount;
    superSaveAmount.sut_super_trust_discount = msqDiscountPercentage.stSutDiscount;
    superSaveAmount.credit_sale_discount = msqDiscountPercentage.creditSaleDiscount;
    superSaveAmount.msqx_credit_sale_discount = msqDiscountPercentage.msqxCreditSaleDiscount;
    superSaveAmount.sut_credit_sale_discount = msqDiscountPercentage.sutCreditSaleDiscount;

    setSuperSaveAmount({ ...superSaveAmount })
      .then((res) => {
        refetchSuperSaveAmount();
        resetForm();
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
        toast(err?.response?.data.message, {
          type: "error",
        });
      });
  };
  const handleSliderChange = (_: Event, newRatioValue: number | number[], updateKey: string) => {
    setMsqDiscountPercentage((prevMsqDiscountPercentage) => ({
      ...prevMsqDiscountPercentage,
      [updateKey]: newRatioValue as number,
    }));
  };
  return (
    <CustomDialog open={open} onClose={handleClose} titleText={text("set_percentage_of_msq_and_msqx_discount")} maxWidth="sm">
      <Box sx={{
        display: "flex", flexDirection: "column"
      }} component="form" onSubmit={onSubmit} >
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              MSQ Discount
            </span>
            <span>
              {msqDiscountPercentage.msqDiscount}%
            </span>
          </span>

          <Slider
            aria-label="msq Discount"
            defaultValue={
              msqDiscountPercentage.msqDiscount
            }
            onChange={(e, newVal) => handleSliderChange(e, newVal, "msqDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              ST MSQ Discount
            </span>
            <span>
              {msqDiscountPercentage.stMsqDiscount}%
            </span>
          </span>
          <Slider
            aria-label="st Msq Discount"
            defaultValue={msqDiscountPercentage.stMsqDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "stMsqDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              MSQX Discount
            </span>
            <span>
              {msqDiscountPercentage.msqxDiscount}%
            </span>
          </span>
          <Slider
            aria-label="msqx Discount"
            defaultValue={msqDiscountPercentage.msqxDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "msqxDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              ST MSQX Discount
            </span>
            <span>
              {msqDiscountPercentage.stMsqxDiscount}%
            </span>
          </span>
          <Slider
            aria-label="st Msqx Discount"
            defaultValue={msqDiscountPercentage.stMsqxDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "stMsqxDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              SUT Discount
            </span>
            <span>
              {msqDiscountPercentage.sutDiscount}%
            </span>
          </span>
          <Slider
            aria-label="sut Discount"
            defaultValue={msqDiscountPercentage.sutDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "sutDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              ST SUT Discount
            </span>
            <span>
              {msqDiscountPercentage.stSutDiscount}%
            </span>
          </span>
          <Slider
            aria-label="st Sut Discount"
            defaultValue={msqDiscountPercentage.stSutDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "stSutDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              MSQ Credit Sale Discount
            </span>
            <span>
              {msqDiscountPercentage.creditSaleDiscount}%
            </span>
          </span>
          <Slider
            aria-label="msq Credit Sale Discount"
            defaultValue={msqDiscountPercentage.creditSaleDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "creditSaleDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              MSQX Credit Sale Discount
            </span>
            <span>
              {msqDiscountPercentage.msqxCreditSaleDiscount}%
            </span>
          </span>
          <Slider
            aria-label="msqx Credit Sale Discount"
            defaultValue={msqDiscountPercentage.msqxCreditSaleDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "msqxCreditSaleDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <div className="p-4">
          <span className="py-4">
            <span className="text-slate-400 mr-2">
              SUT Credit Sale Discount
            </span>
            <span>
              {msqDiscountPercentage.sutCreditSaleDiscount}%
            </span>
          </span>
          <Slider
            aria-label="sut Credit Sale Discount"
            defaultValue={msqDiscountPercentage.sutCreditSaleDiscount}
            onChange={(e, newVal) => handleSliderChange(e, newVal, "sutCreditSaleDiscount")}
            valueLabelDisplay="auto"
            className="mt-4"
          />
        </div>
        <Box sx={{ display: "flex", columnGap: 2 }}>
          <FormFooter
            handleClose={handleClose}
            loading={isLoading}
            cancelText={text("set_standard_amount_modal_cancel")}
            submitText={text("set_standard_amount_modal_save")}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default StandardDiscountAmountModal;
