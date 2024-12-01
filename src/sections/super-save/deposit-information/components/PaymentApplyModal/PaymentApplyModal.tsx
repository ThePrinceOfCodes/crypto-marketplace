import {
  Box,
  Radio,
} from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { PaymentApplyModalRef, Info } from "./types";
import { useDialog } from "@common/context";
import { useRejectDepositRequest } from "api/hooks";
import { LocalKeys, useLocale } from "locale";
import { DataRow } from "@common/components";
import { queryClient } from "api";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";
import { toast } from "react-toastify";

const reasons = [
  "payment_apply_modal_reason_1",
  "payment_apply_modal_blackList",
];

function PaymentApplyModal(
  {
    onSubmit,
  }: {
    onSubmit: () => void;
  },
  ref: Ref<PaymentApplyModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [direct, setDirect] = useState(false);
  const { confirmDialog, alertDialog } = useDialog();
  const { mutateAsync: rejectRequest } = useRejectDepositRequest();

  useImperativeHandle(
    ref,
    () => ({
      open: (_info) => {
        setInfo(_info);
        setOpen(true);
      },
    }),
    [],
  );

  const onClose = () => {
    setInfo(null);
    setReason("");
    setDirect(false);
    setOpen(false);
  };

  const onReject = () => {
    if (reason?.trim()?.length > 0) {
      confirmDialog({
        title: `${text("deposit_information_status_reject")} ${text("deposit_information_payment")}`,
        content: `${text("deposit_information_reject_warning_msg")} ${text("deposit_information_single_payment_selected")}`,
        onOk: async () => {
          await rejectRequest({
            remark: text(reason as LocalKeys),
            request_ids: [info?.request_id || ""],
          }).then(() => {
            onSubmit();
            toast.success(`${text("deposit_information_payment")} ${text("deposit_information_payment_rejected")}`);
            onClose();
            queryClient.invalidateQueries("deposit-requests");
          });
        },
      });
    } else {
      alertDialog({
        title: text("payment_apply_modal_reject_select_reason"),
      });
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("payment_apply_modal_refusal_title")}
      maxWidth="lg"
      fullWidth={false}
    >
      <Box className="lg:w-[660px] overflow-x-auto border">
          <DataRow
            label={text("payment_apply_modal_user_name_title")}
            value={<p>{info?.name}</p>}
          />
          <DataRow
            label={text("payment_apply_modal_user_id_title")}
            value={<p>{info?.user_id}</p>}
          />
          <DataRow
            label={text("payment_apply_modal_email_title")}
            value={<p>{info?.email}</p>}
          />
          <DataRow
            labelConClassName="text-red-600 font-semibold h-[210px]"
            label={text("payment_apply_modal_reason")}
            value={
              <div>
                {reasons.map((_reason) => (
                  <div key={_reason} onClick={() => setReason(_reason)}>
                    <label aria-label={_reason}>
                      <Radio checked={_reason === reason} />
                      {text(_reason as LocalKeys)}
                    </label>
                  </div>
                ))}
                <div
                  onClick={() => {
                    setDirect(true);
                    setReason("");
                  }}
                >
                  <label aria-label="direct Input">
                    <Radio checked={!reasons.includes(reason) && direct} />
                     {text("payment_apply_modal_direct_input")}
                  </label>
                </div>
                <textarea
                  disabled={!(!reasons.includes(reason) && direct)}
                  onChange={(e) => setReason(e.target.value)}
                  value={!reasons.includes(reason) && direct ? reason : ""}
                  placeholder={text(
                    "payment_apply_modal_enter_reason_placeholder",
                  )}
                  className={`${!reasons.includes(reason) && direct ? "w-full form-textarea" : "bg-[#EEF0F4] w-full form-textarea"
                    }`}
                />
              </div>
            }
          />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", columnGap: 2, marginTop: "28px" }}>
        <FormFooter
          handleClose={onClose}
          cancelText={text("payment_apply_modal_cancel")}
          submitText={text("payment_apply_modal_reject")}
          onSubmit={onReject}
          sx={{ width: "144px" }}
        />
      </Box>
    </CustomDialog>
  );
}

export default forwardRef(PaymentApplyModal);