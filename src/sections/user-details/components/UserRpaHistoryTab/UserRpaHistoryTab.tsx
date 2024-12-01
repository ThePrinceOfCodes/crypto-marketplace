import useInitialTabRender from "@common/hooks/useInitialTabRender";
import React, { useCallback } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useLocale } from "locale";
import { useState } from "react";
import RpaHistory from "../RpaHistory/RpaHistoryTab";
import { CardInformation } from "../CardInformation";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function UserRpaHistoryTab() {
  const [value, setValue] = useState(0);
  const { text } = useLocale();
  const { initialRender, setInitialRender } = useInitialTabRender(3);

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

  return (
    <>
      <div className="h-full px-5 py-5">
        <Tabs className="flex" value={value} onChange={handleChange}>
          <Tab
            label={text("user_rpa_history_title")}
            className="rounded-l-lg flex-1 border border-neutral-200  border-solid"
          />
          <Tab
            label={text("user_rpa_history_card_info_tab")}
            className="rounded-r-lg flex-1 border border-neutral-200  border-solid"
          />
        </Tabs>
        <TabPanel value={value} index={0}>
          <RpaHistory />
        </TabPanel>
        {initialRender[1] && (
          <TabPanel value={value} index={1}>
            <CardInformation/>
          </TabPanel>
        )}
      </div>
    </>
  );
}

export default UserRpaHistoryTab;
