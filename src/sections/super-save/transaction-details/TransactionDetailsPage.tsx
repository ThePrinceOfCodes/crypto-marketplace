import { Box, Breadcrumbs, Link, Tab, Tabs } from "@mui/material";
import { CurrencyType } from "@sections/super-save";
import React, { useCallback, useState } from "react";
import { BasicInformationTab } from "./components";
import { useRouter } from "next/router";
import { useLocale } from "locale";
import { useGetWithdrawals } from "api/hooks";
import WithdrawalInformationScreen from "../withdrawal-information/WithdrawalInformationPage";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TransactionDetailsPage() {
  const { text } = useLocale();
  const [value, setValue] = useState(0);
  const { tId, type } = useRouter().query as {
    tId: string;
    type: CurrencyType;
  };

  const { data, isLoading } = useGetWithdrawals(
    {
      type: type,
      transaction_id: tId,
      limit: 25,
      page: 1,
    },
    {
      enabled: tId?.length > 0,
      select: (res) => {
        return {
          ...res,
          details: {
            ...res.details,
            payment_currency:
              type === "USDT" ? "USDT" : text("korean_currency_name"),
          },
        };
      },
    },
  );

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`basic-information-tabpanel-${index}`}
        aria-labelledby={`basic-information-tab-${index}`}
        {...other}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </div>
    );
  }, []);

  return (
    <div className="h-full px-5 py-5">
      <Breadcrumbs aria-label="breadcrumb" className="w-full">
        <Link
          underline="hover"
          color="inherit"
          className="text-xs"
          href="/super-save/withdrawal-information"
        >
          {text("withdrawal_information_title")}
        </Link>
        <Link
          underline="hover"
          color="inherit"
          className="text-xs"
          href={"/super-save/transaction-details?tId=" + tId}
        >
          {text("transaction_detail_title")}
        </Link>
      </Breadcrumbs>
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium">{tId}</h4>
        <span className="text-slate-500 text-sm">
          {text("transaction_detail_subtitle")}
        </span>
      </div>
      <Tabs
        className="flex"
        value={value}
        onChange={handleChange}
        sx={{
          "& .MuiTabs-scroller": {
            height: "auto !important",
          },
        }}
      >
        <Tab
          label={text("users_detail_tab_basic_information")}
          className="rounded-l-lg flex-1 border border-neutral-200 border-solid"
        />
        <Tab
          label={text("withdrawal_information_title")}
          className="rounded-r-lg flex-1 border border-neutral-200 border-solid"
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <BasicInformationTab details={data?.details} isLoading={isLoading} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <WithdrawalInformationScreen
          transaction_id={tId}
          type="tab"
          currency={type}
        />
      </TabPanel>
    </div>
  );
}

export default TransactionDetailsPage;
