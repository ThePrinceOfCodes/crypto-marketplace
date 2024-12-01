import useInitialTabRender from "@common/hooks/useInitialTabRender";
import { Box, Tab, Tabs } from "@mui/material";
import {
  UserBankDetailsTab,
  UserWalletDetailsTab,
} from "@sections/user-details/components";
import { ISuperUserDetail } from "api/hooks";
import React, { useCallback, useEffect, useState } from "react";
import { useLocale } from "locale";

interface SuperSaveBankWalletDetailsTabProps {
  userDetails?: ISuperUserDetail;
  initialTab: number;
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const SuperSaveBankWalletDetailsTab = ({
  userDetails,
  initialTab,
}: SuperSaveBankWalletDetailsTabProps) => {
  const [value, setValue] = useState(0);
  const { text } = useLocale();
  const { initialRender, setInitialRender } = useInitialTabRender(2);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setInitialRender(newValue);
    setValue(newValue);
  };

  const TabPanel = useCallback((props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        <Box>{children}</Box>
      </div>
    );
  }, []);

  useEffect(() => {
    if (initialTab !== value) setValue(initialTab);
    setInitialRender(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  return (
    <div className="h-full px-5 py-5">
      <Tabs className="flex" value={value} onChange={handleChange}>
        <Tab
          label={text("users_detail_tab_bank_details")}
          className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
        />
        <Tab
          label={text("users_detail_tab_wallet_details")}
          className="flex-1 border border-neutral-200  border-solid"
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        {initialRender[0] &&<UserBankDetailsTab userDetails={userDetails} />}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {initialRender[1] && <UserWalletDetailsTab userDetails={userDetails} />}
      </TabPanel>
    </div>
  );
};

export default SuperSaveBankWalletDetailsTab;
