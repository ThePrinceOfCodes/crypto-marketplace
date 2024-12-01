import useInitialTabRender from "@common/hooks/useInitialTabRender";
import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { useGetSuperUserDetail } from "api/hooks";
import { Box, Tab, Tabs } from "@mui/material";
import { useLocale } from "locale";
import { useState } from "react";

import {
  DailyCalculationInformationPage,
  DepositInformationPage,
  WithdrawalInformationPage,
} from "@sections/super-save";
import { clearFilters } from "@sections/user-details/SuperUserDetailScreen";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function SuperSaveHistoryTab() {
  const [value, setValue] = useState(0);
  const { text } = useLocale();
  const router = useRouter()
  const email = router.query.email as string;
  const { initialRender, setInitialRender } = useInitialTabRender(3);
  const { data: user_details } = useGetSuperUserDetail({ email: email });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setInitialRender(newValue);
    setValue(newValue);
    router.query = clearFilters(router.query)
    router.push(router)
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

  return (
    <>
      <div className="h-full px-5 py-5">
        <Tabs className="flex" value={value} onChange={handleChange}>
          <Tab
            label={text("users_detail_tab_super_save_history_sub_tab_deposit")}
            className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
          />
          <Tab
            label={text(
              "users_detail_tab_super_save_history_sub_tab_withdrawal",
            )}
            className="flex-1 border border-neutral-200  border-solid"
          />
          <Tab
            label={text(
              "users_detail_tab_super_save_history_sub_tab_daily_calculation",
            )}
            className="flex-1 border border-neutral-200  border-solid"
          />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DepositInformationPage user_id={user_details?.user_id} />
        </TabPanel>
        {initialRender[1] && (
          <TabPanel value={value} index={1}>
            <WithdrawalInformationPage user_id={user_details?.user_id} />
          </TabPanel>
        )}
        {initialRender[2] && (
          <TabPanel value={value} index={2}>
            <DailyCalculationInformationPage user_id={user_details?.user_id} />
          </TabPanel>
        )}
      </div>
    </>
  );
}

export default SuperSaveHistoryTab;
