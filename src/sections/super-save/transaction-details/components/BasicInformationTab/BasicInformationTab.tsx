import { useRouter } from "next/router";
import React from "react";
import { DataRow } from "@common/components";
import { useLocale } from "locale";
import { iGetWithdrawalsResp } from "api/hooks";
import { Box, CircularProgress } from "@mui/material";

function BasicInformationTab({
  details,
  isLoading,
}: {
  isLoading: boolean;
  details?: iGetWithdrawalsResp["details"];
}) {
  const { text } = useLocale();
  const { type } = useRouter().query as { type: string };
  const currencySuffix =
    type === "USDT" ? "USDT" : text("korean_currency_name");

  const labelText: {
    [key in keyof iGetWithdrawalsResp["details"]]: {
      label: string;
      suffix?: string;
    };
  } = {
    user_name: { label: "basic_information_name" },
    user_id: { label: "basic_information_user_id" },
    user_email: { label: "basic_information_email" },
    payment_currency: { label: "basic_information_currency" },
    weekly_payout_amount: {
      label: "basic_information_weekly_payment",
      suffix: currencySuffix,
    },
    bank_fee: {
      label: "basic_information_bank_fee",
      suffix: currencySuffix,
    },
    deducted_payment: {
      label: "basic_information_deducted_payment",
      suffix: currencySuffix,
    },
    bank_name: { label: "basic_information_withdrawal_bank" },
    bank_account_number: { label: "basic_information_account_number" },
    repayment_date: { label: "withdrawal_information_header_repayment_date" },
    transaction_id: { label: "basic_information_transaction_id" },
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="border border-1 overflow-auto">
      {Object.entries(labelText).map(([_key, { label, suffix }]) => {
        const key = _key as keyof iGetWithdrawalsResp["details"];
        let value = details?.[key]?.toLocaleString("ko-KR") || "---";

        if (key === "repayment_date" && value.length > 3) {
          value = `${value.slice(0, 10)} ${value.slice(11, 19)}`;
        }

        return (
          <DataRow
            key={key}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={text(label as any)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={<p>{value + (suffix ? ` ${text(suffix as any)}` : "")}</p>}
          />
        );
      })}
    </div>
  );
}

export default BasicInformationTab;
