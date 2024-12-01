import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { Ref, forwardRef, useImperativeHandle, useState } from "react";
import { ViewBankChangeModalRef, Info } from "./types";
import { useDialog } from "@common/context";
import {
  useRejectBankChangeRequest,
  useApproveBankChangeRequest,
} from "api/hooks";
import { useLocale } from "locale";
import { DataRow } from "@common/components";
import { Button } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { Spinner } from "@common/components";

function ViewBankChangeModal(
  {
    onSubmit,
  }: {
    onSubmit: () => void;
  },
  ref: Ref<ViewBankChangeModalRef>,
) {
  const { text } = useLocale();
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [isApproveSubmitting, setIsApproveSubmitting] = useState(false);
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);

  const { confirmDialog, alertDialog } = useDialog();
  const { mutateAsync: rejectRequest } = useRejectBankChangeRequest();
  const { mutateAsync: approveRequest } = useApproveBankChangeRequest();

  useImperativeHandle(
    ref,
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      open: (_info: any) => {
        setInfo(_info);
        setOpen(true);
      },
    }),
    [],
  );

  const onClose = () => {
    setInfo(null);
    setOpen(false);
  };

  const onApprove = () => {
    setIsApproveSubmitting(true);

    approveRequest({
      user_id: info?.user_id || "",
    }).then(() => {
      onSubmit();
      alertDialog({
        title: text("corporate_user_details_bank_updated"),
      });
      onClose();
      setIsApproveSubmitting(false);
    });
  };

  const onReject = () => {
    confirmDialog({
      title: text("corporate_user_details_reject_bank_change_request_title"),
      content: text("corporate_user_details_reject_bank_change_request_content"),
      onOk: async () => {
        setIsRejectSubmitting(true);

        rejectRequest({
          user_id: info?.user_id || "",
        }).then(() => {
          onSubmit();
          alertDialog({
            title: text("corporate_user_details_bank_rejected"),
          });
          onClose();
          setIsRejectSubmitting(false);
        });
      },
    });
  };

  return (
    <Dialog maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle className="flex justify-between items-center">
        <Typography className="font-inter  ">
          {text("corporate_user_details_view_bank_change_request")}
        </Typography>
        <button
          aria-label="close icon"
          className="flex items-start text-slate-400 h-8 w-8"
          onClick={onClose}
        >
          <XMarkIcon className="h-8 w-8 p-1" />
        </button>
      </DialogTitle>
      <DialogContent>
        <div className="border border-1">
          <DataRow
            labelConClassName="text-sm font-medium"
            valueConClassName="text-sm font-medium"
            label={text("user_column_header_corporate_bank")}
            value={<p>{info?.bankName}</p>}
          />
          <DataRow
            labelConClassName="text-sm font-medium"
            valueConClassName="text-sm font-medium"
            label={text("user_column_header_corporate_bank_account_no")}
            value={<p>{info?.bankAccountNumber}</p>}
          />
          <DataRow
            labelConClassName="text-sm font-medium"
            valueConClassName="text-sm font-medium"
            label={text("user_column_header_corporate_bank_account_holder")}
            value={<p>{info?.bankAccountHolderName}</p>}
          />

          <DataRow
            labelConClassName="text-sm font-medium"
            label={text("user_column_header_corporate_bankbook")}
            value={
              <p>
                <a
                  href={
                    typeof info?.bankStatementFile === "string"
                      ? info?.bankStatementFile
                      : undefined
                  }
                >
                  <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
                    {text("users_view_files_downdload_pdf")}
                  </Button>
                </a>
              </p>
            }
          />
        </div>
      </DialogContent>
      <DialogActions className="flex justify-center">
        <button
          className=" mr-1 rounded-md border border-transparent bg-slate-200 py-2 w-36 text-sm font-medium text-slate-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={onClose}
        >
          {text("common_cancel_button")}
        </button>

        <Button
          variant="outlined"
          color="error"
          onClick={onReject}
          disabled={isRejectSubmitting || isApproveSubmitting}
          value="reject"
          className="ml-1 group rounded-md py-2 w-36 text-sm font-medium "
        >
          {isRejectSubmitting ? (
            <Spinner />
          ) : (
            text("users_membership_status_reject")
          )}
        </Button>

        <Button
          type="submit"
          variant="outlined"
          onClick={onApprove}
          color="primary"
          disabled={isRejectSubmitting || isApproveSubmitting}
          className="ml-1 group rounded-md py-2 w-36 text-sm font-medium "
        >
          {isApproveSubmitting ? (
            <Spinner />
          ) : (
            text("users_membership_status_approve")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default forwardRef(ViewBankChangeModal);
