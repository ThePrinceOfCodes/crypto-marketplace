import { htmlIds } from "@cypress/utils/ids";
import { Tab, Tabs } from "@mui/material";
import React from "react";
import { useLocale } from "locale";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LanguageSelectedTab = ({ selectedLang, handleLanguageChange }: any) => {
  const { text } = useLocale();
  return (
    <Tabs
      className="flex"
      value={selectedLang.type}
      onChange={handleLanguageChange}
    >
      <Tab
        value={"KRW"}
        id={htmlIds.btn_user_details_select_basic_information_tab}
        label={text("korean_currency_name")}
        className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
      />
      <Tab
        value={"USDT"}
        id={htmlIds.btn_user_details_select_token_tab}
        label={"USDT"}
        className="rounded-r-lg flex-1 border border-neutral-200  border-solid"
      />
    </Tabs>
  );
};

export default LanguageSelectedTab;
