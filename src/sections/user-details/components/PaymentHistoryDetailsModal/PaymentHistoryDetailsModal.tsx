import { DataRow } from "@common/components";
import { formatNumberWithCommas } from "@common/utils/formatters";
import { Box } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { PayHistoryDetails } from "api/hooks";
import clsx from "clsx";
import { useLocale } from "locale";
import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import CustomDialog from "@common/components/CustomDialog";
import FormFooter from "@common/components/FormFooter";

export type PaymentHistoryDetailsModalType = {
  open: boolean;
  pay_history: PayHistoryDetails | null;
  previous_balance: number | null;
  new_balance: number | null;
  onClose: () => void
};

function PaymentHistoryDetailsModal(
  { open, onClose, pay_history, previous_balance, new_balance }: PaymentHistoryDetailsModalType
) {
  const { text } = useLocale();

  const getDate = () => {
    const inputDate = pay_history?.approvalDate;
    const inputTime = pay_history?.approvalTime;

    if ((!inputDate || inputDate?.length < 8) || (!inputTime || inputTime?.length < 6))
      return "";

    return `${inputDate.substring(0, 4)}-${inputDate.slice(4, 6)}-${inputDate.slice(6, 8)} ${inputTime.slice(0, 2)}:${inputTime.slice(2, 4)}:${inputTime.slice(4, 6)} KST`;
  };


  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      titleText={text("user_details_transaction_history_tab_pay_history_modal_title")}
      maxWidth="md"
      fullWidth={false}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", rowGap: 2}}
      >
       <div className="border overflow-x-auto">
          <DataRow
            label={text("user_rpa_history_header_id")}
            value={<p>{pay_history?.id}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_date")}
            value={<p>{getDate()}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_card_company")}
            value={<p>{pay_history?.companyName} ({pay_history?.companyCode})</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_card_number")}
            value={<p>{pay_history?.cardNumber}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_store")}
            value={<div className={"flex space-x-2"}><p>{pay_history?.merchantName}</p>
              <Tooltip
                title={ pay_history?.isAffiliated ?
                  text("user_details_transaction_history_tab_pay_history_modal_affiliated") :
                  text("user_details_transaction_history_tab_pay_history_modal_not_affiliated") }>
                <DoneIcon sx={{ color: pay_history?.isAffiliated ? "green" : "gray" }}/>
              </Tooltip>
            </div>}
          />
          {
            pay_history?.salesType!=undefined &&  <DataRow
              label={text("user_details_transaction_history_tab_pay_history_modal_sales_type")}
              value={<p>{`${pay_history.salesType}`}</p>}
            />
          }
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_amount")}
            value={<p>{formatNumberWithCommas(pay_history?.amount)}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_mining_percentage")}
            value={<p>{pay_history?.percentage}%</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_earned_p2u")}
            value={<p>{formatNumberWithCommas(pay_history?.point)}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_threshold")}
            value={<p>{pay_history?.threshold} {text("withdrawal_information_days")}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_payment_status")}
            value={<p
              className={clsx(pay_history?.paymentStatus === "PAID" ? "text-[green]" : "text-[red]")}>{pay_history?.paymentStatus}</p>}
          />
          <DataRow
            label={text("user_details_transaction_history_tab_pay_history_modal_mining_period")}
            value={<p
              className={clsx(pay_history?.isAccumulated ? "text-[green]" : "text-[red]")}>{pay_history?.isAccumulated ?
                text("user_details_bank_details_yes") : text("user_details_bank_details_no")}</p>}

          />
          {
            pay_history?.isDuplicated!=undefined &&  <DataRow
              label={text("user_details_transaction_history_tab_pay_history_modal_accumulated_by")}
              value={<p>{`${pay_history.isDuplicated}`}</p>}
            />
          }
          {
            previous_balance!=undefined &&  <DataRow
              label={text("user_details_transaction_history_tab_pay_history_modal_previous_balance")}
              value={<p>{`${formatNumberWithCommas(previous_balance)}`}</p>}
            />
          }
          {
            new_balance!=undefined &&  <DataRow
              label={text("user_details_transaction_history_tab_pay_history_modal_new_balance")}
              value={<p>{`${formatNumberWithCommas(new_balance)}`}</p>}
            />
          }

        </div>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <FormFooter
            showCancelButton={false}
            onSubmit={onClose}
            submitText={text("view_consent_history_ok")}
            sx={{ width: "144px" }}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
}

export default PaymentHistoryDetailsModal;
