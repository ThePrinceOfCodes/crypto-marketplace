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

const StandardRatioAmountModal: React.FC<{
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}> = ({ open, handleClose: onCancel, handleSubmit }) => {
  const { text } = useLocale();
  const { alertDialog } = useDialog();
  const { data, refetch: refetchSuperSaveAmount } = useGetSuperSaveAmount();
  const { mutateAsync: setSuperSaveAmount, isLoading } =
    useSetSuperSaveAmount();

  const [msqP2U, setMsqP2U] = useState(0);
  const [msqxP2U, setMsqxP2U] = useState(0);
  const [sutP2U, setSutP2U] = useState(0);

  useEffect(() => {
    setMsqP2U(data?.super_trust_ratio ? 100 - data?.super_trust_ratio : 100);
    setMsqxP2U(
      data?.msqx_super_trust_ratio ? 100 - data?.msqx_super_trust_ratio : 100,
    );
    setSutP2U(
      data?.sut_super_trust_ratio ? 100 - data?.sut_super_trust_ratio : 100,
    );
  }, [data, open, setMsqP2U, setMsqxP2U, setSutP2U]);

  const resetForm = () => {
    setMsqP2U(0);
    setMsqxP2U(0);
    setSutP2U(0);
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

    superSaveAmount.super_trust_ratio = 100 - msqP2U;
    superSaveAmount.msqx_super_trust_ratio = 100 - msqxP2U;
    superSaveAmount.sut_super_trust_ratio = 100 - sutP2U;

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
  return (
    <CustomDialog open={open} onClose={handleClose} titleText={text("set_percentage_of_msq_msqx_sut_and_p2u")} maxWidth="sm">
      <Box sx={{ display: "flex", flexDirection: "column" }}  component="form"
        onSubmit={onSubmit}>
          <div className="p-4">
            <span className="py-4">
              <span className="text-slate-400">{"MSQ & P2U"}: </span>
              <span>
                {msqP2U}% / {100 - msqP2U}%
              </span>
            </span>
            <Slider
              aria-label="msqP2U"
              defaultValue={100 - (data?.super_trust_ratio || 0)}
              onChange={(_, newRatioValue) =>
                setMsqP2U(newRatioValue as number)
              }
              valueLabelDisplay="auto"
              className="mt-4"
            />
          </div>
          <div className="p-4">
            <span className="py-4">
              <span className="text-slate-400">{"MSQX & P2U"}: </span>
              <span>
                {msqxP2U}% / {100 - msqxP2U}%
              </span>
            </span>
            <Slider
              aria-label="msqxP2U"
              defaultValue={100 - (data?.msqx_super_trust_ratio || 0)}
              onChange={(_, newRatioValue) =>
                setMsqxP2U(newRatioValue as number)
              }
              valueLabelDisplay="auto"
              className="mt-4"
            />
          </div>
          <div className="p-4">
            <span className="py-4">
              <span className="text-slate-400">{"SUT & P2U"}: </span>
              <span>
                {sutP2U}% / {100 - sutP2U}%
              </span>
            </span>
            <Slider
              aria-label="sutP2U"
              defaultValue={100 - (data?.sut_super_trust_ratio || 0)}
              onChange={(_, newRatioValue) =>
                setSutP2U(newRatioValue as number)
              }
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
    </CustomDialog >
  );
};

export default StandardRatioAmountModal;