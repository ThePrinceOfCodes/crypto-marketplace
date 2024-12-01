import useInitialTabRender from "@common/hooks/useInitialTabRender";
import React, { useCallback, useEffect, useState,useRef } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import {
  SettingBillPanel,
  SettingManageVariablesPanel,
  SettingUpdatePasswordPanel,
  SettingUserProfilePanel,
  SettingUsersPanel,
} from "./components";
import { useAuth } from "@common/context";
import { useLocale } from "locale";
import { useRouter } from "next/router";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function PageSettings() {
  const { initialRender, setInitialRender } = useInitialTabRender(5);
  const [value, setValue] = useState(0);
  const formikRef = useRef<{ resetForm: () => void }>(null);
  const { hasAuth } = useAuth();
  const { text } = useLocale();
  const router = useRouter();
  const { tabIndex } = router.query;

  useEffect(() => {
    if (tabIndex != undefined) {
      const tabValue = Number(tabIndex);
      setValue(tabValue);
      setInitialRender(tabValue);
    }
  }, [tabIndex]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const updatedQuery = { 
      ...router.query, 
      tabIndex: newValue.toString() 
    };
    router.push({
      pathname: router.pathname,
      query: updatedQuery,
    });
    if (newValue !== value && formikRef.current) {
      formikRef.current.resetForm();
    }
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
        <Box sx={{ p: 4 }}>{children}</Box>
      </div>
    );
  }, []);

  return (
    <div className="h-full px-5 py-5 settings">
      <div className="w-full mb-5 pb-5 platforms-header">
        <h4 className="text-2xl font-medium"> {text("settings_title")}</h4>
        <span className="text-slate-500 text-sm">
          {text("settings_subtitle")}
        </span>
      </div>

      <Box sx={{ width: "100%" }}>
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="settings tab"
            variant="scrollable"
          >
            <Tab label={text("setting_tab_profile")} {...a11yProps(0)} />
            <Tab label={text("setting_tab_billing")} {...a11yProps(1)} />
            <Tab label={text("setting_tab_password")} {...a11yProps(2)} />
            {hasAuth('root') && (
              <Tab label={text("setting_tab_users")} {...a11yProps(3)} />
            )}
            {hasAuth('root') && (
              <Tab label={text("setting_tab_variables")} {...a11yProps(4)} />
            )}
          </Tabs>
        </Box>
        <TabPanel value={value} index={0} >
          <SettingUserProfilePanel />
        </TabPanel>
        {initialRender[1] && (
          <TabPanel value={value} index={1}>
            <SettingBillPanel />
          </TabPanel>
        )}
        {initialRender[2] && (
          <TabPanel value={value} index={2}>
            <SettingUpdatePasswordPanel ref={formikRef} />
          </TabPanel>
        )}
        {hasAuth('root') && (
          <>
            {initialRender[3] && (
              <TabPanel value={value} index={3}>
                <SettingUsersPanel />
              </TabPanel>
            )}
            {initialRender[4] && (
              <TabPanel value={value} index={4}>
                <SettingManageVariablesPanel />
              </TabPanel>
            )}
          </>
        )}
      </Box>
    </div>
  );
}

export default PageSettings;
